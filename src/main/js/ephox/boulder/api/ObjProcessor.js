define(
  'ephox.boulder.api.ObjProcessor',

  [
    'ephox.boulder.api.ObjReader',
    'ephox.boulder.api.ObjWriter',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'global!Error'
  ],

  function (ObjReader, ObjWriter, Json, Fun, Option, Result, Error) {
    var doExtract = function (path, readerTypes, f, obj) {
      var readValues = Arr.map(readerTypes, function (rt) {
        return rt.fold(function (okey, value) {
          // output
          return Result.value(wrap(okey, f(value)));
        }, function (key, okey) {
          // // strict
          // return readFrom(obj, key).fold(function () {
          //   return Result.error([ 'Path: ' + path.join(' > ') + '\nCould not find valid value for "' + key + '" in ' + Json.stringify(obj, null, 2) ]);
          // }, function (v) {
          //   return Result.value(wrap(okey, f(v)));
          // });
          
        }, function (key, okey, fallback) {
          // withDefault
          // var value = readFrom(obj, key).getOr(fallback);
          // return Result.value(wrap(okey, f(value)));
        }, function (key, okey) {
          // asOption
          // var value = readFrom(obj, key);
          // return Result.value(wrap(okey, f(value)));
        }, function (key, okey, children) {
          // strict group
          return readFrom(obj, key).fold(function () {
            return Result.error([
              'Path: ' + path.join(' > ') + '\nCould not find valid value for "' + key + '" in ' + Json.stringify(obj, null, 2)
            ]);
          }, function (groupData) {
            var group = doExtract(path.concat([ key ]), children, f, groupData);
            return group.map(function (g) {
              return wrap(okey, f(g));  
            });
          });
        }, function (key, okey, children, fallback) {
          // default group
          var groupData = readFrom(obj, key).getOr(fallback);
          var group = doExtract(path.concat([ key ]), children, f, groupData);
          return group.map(function (g) {
            return wrap(okey, f(g));
          });
        }, function (key, okey, children, ifTrue) {
          // option group
          var groupData = obj[key] === undefined || obj[key] === false ? Option.none() : Option.some(obj[key] === true ? ifTrue : obj[key]);
          return groupData.fold(function () {
            return Result.value(wrap(okey, f(Option.none())));
          }, function (gd) {
            return doExtract(path.concat([ key ]), children, f, gd).map(function (group) {
              return wrap(okey, f(Option.some(group)));
            });
          });
        },

        function (key, okey, props) {
          // strict array
          return readFrom(obj, key).fold(function () {
            return Result.error([
              'Path: ' + path.join(' > ') + '\nCould not find valid value for "' + key + '" in ' + Json.stringify(obj, null, 2)
            ]);
          }, function (arrayData) {
            // Probably will need to concat this.
            var extracted = Arr.map(arrayData, function (x, i) {
              return doExtract(path.concat([ key + '[' + i + ']' ]), props, f, x);
            });

            var consolidated = consolidateArr(extracted, {});
            return consolidated.map(function (c) {
              return wrap(okey, c);
            });

            console.log('extracted', extracted, consolidate(extracted, {}));
          });
        },

        function (key, okey, props, fallback) {
          // default array
          return Result.error('defaultArray Not implemented');

        },

        function (key, okey, pops) {
          //option array
          return Result.error('optionArray Not implemented');

        }, function (okey, constructor) {
          // state
          // var state = constructor();
          // return Result.value(wrap(okey, f(state)));
        }, function (g) {
          // custom
          // return f(g(obj));
        }, function (okey) {
          // return Result.value(wrap(okey, f(obj)));
        });
      });
      return consolidate(readValues, { });
    };

    var extractReader = function (path, readerTypes, wrapping) {
      return function (obj) {
        var extracted = doExtract(path, readerTypes, wrapping, obj);
        return extracted.fold(function (errs) {
          throw new Error('Invalid attempt to read: ' + Json.stringify(obj) + '.\n' + errs.join('\n'));
        }, Fun.identity);
      };
    };

    var strictAccess = function (path, obj, key) {
      // In strict mode, if it undefined, it is an error.
      return ObjReader.readOptFrom(obj, key).fold(function () {
        return Result.error([ 'Path: ' + path.join(' > ') + '\nCould not find valid value for "' + key + '" in ' + Json.stringify(obj, null, 2) ]);
      }, Result.value);
    };

    var fallbackAccess = function (obj, key, fallback) {
      return Result.value(ObjReader.readOr(key, fallback)(obj));
    };

    var optionAccess = function (obj, key) {
      return Result.value(ObjReader.readOptFrom(obj, key));
    };

    var doExtractOne = function (path, obj, field, strength) {
      return field.fold(
        // property
        function (key, okey, presence, validation) {
          var publish = function (v) {
            return ObjWriter.wrap(okey, strength(v));
          };

          // Check presence to work out if it is necessary. Ignore validation for the time being.
          return presence.fold(
            // strict
            function () {
              return strictAccess(path, obj, key).map(publish);
            },
            // defaulted
            function (fallback) { 
              return fallbackAccess(obj, key, fallback).map(publish);
            },
            // option
            function () {
              return optionAccess(obj, key).map(publish);
            }
          );
        },

        // return readFrom(obj, key).fold(function () {
        //     return Result.error([
        //       'Path: ' + path.join(' > ') + '\nCould not find valid value for "' + key + '" in ' + Json.stringify(obj, null, 2)
        //     ]);
        //   }, function (groupData) {
        //     var group = doExtract(path.concat([ key ]), children, f, groupData);
        //     return group.map(function (g) {
        //       return wrap(okey, f(g));  
        //     });
        //   });

        // obj
        function (key, okey, presence, validation, fields) {
          var grouping = function (groupData) {
            var group = doExtract(path.concat([ key ]), groupData, fields, strength);
            return group.map(function (g) {
              return ObjWriter.wrap(okey, strength(g));
            });
          };

          // Check presence to work out if it is necessary. Ignore validation for the time being.
          return presence.fold(
            // strict
            function () {
              return strictAccess(path, obj, key).bind(grouping);
            },
            // defaulted
            function (fallback) {
              return fallbackAccess(obj, key, fallback).bind(grouping);
            },
            // option
            function () {
              return optionAccess(obj, key).bind(function (optGroupData) {
                return optGroupData.fold(function () {
                  return Result.value(
                    ObjWriter.wrap(okey, strength(Option.none()))
                  );
                }, function (groupData) {
                  var group = doExtract(path.concat([ key ]), groupData, fields, strength);
                  return group.map(function (g) {
                    return ObjWriter.wrap(okey, strength(Option.some(g)));
                  });
                });
              });
            }
          );          

        },


        // arr
        function (key, okey, presence, validation, fields) { },

        // state
        function (okey, instantiator) {
          var v = instantiator(obj);
          return Result.value(ObjWriter.wrap(okey, strength(v)));
        },
        
        // snapshot 
        function (okey) {
          var v = obj;
          return Result.value(ObjWriter.wrap(okey, strength(v)));
        }
      );
    };


    var weak = function (path, obj, fields) {

    };

    var strong = function (path, obj, fields) {

    };

    var validate = function (path, obj, fields) {

    };

    return {
      weak: weak,
      strong: strong,
      validate: validate
    };
  }
);