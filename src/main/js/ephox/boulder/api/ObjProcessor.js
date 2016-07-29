define(
  'ephox.boulder.api.ObjProcessor',

  [
    'ephox.boulder.api.ObjReader',
    'ephox.boulder.api.ObjWriter',
    'ephox.boulder.combine.ResultCombine',
    'ephox.compass.Arr',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'global!Error'
  ],

  function (ObjReader, ObjWriter, ResultCombine, Arr, Json, Fun, Option, Result, Error) {
    var extractReader = function (path, readerTypes, wrapping) {
      return function (obj) {
        var extracted = doExtract(path, obj, readerTypes, wrapping, obj);
        return extracted.fold(function (errs) {
          throw new Error('Invalid attempt to read: ' + Json.stringify(obj) + '.\n' + errs.join('\n'));
        }, Fun.identity);
      };
    };

    var strictAccess = function (path, obj, key) {
      // In strict mode, if it undefined, it is an error.
      return ObjReader.readOptFrom(obj, key).fold(function () {
        var message = 'Failed Path: ' + path.join(' > ') + '\nCould not find valid *strict* value for "' + key + '" in ' + Json.stringify(obj, null, 2);
        return Result.error([ message ]);
      }, Result.value);
    };

    var fallbackAccess = function (obj, key, fallback) {
      return Result.value(ObjReader.readOr(key, fallback)(obj));
    };

    var optionAccess = function (obj, key) {
      return Result.value(ObjReader.readOptFrom(obj, key));
    };

    var doExtract = function (path, obj, fields, strength) {
      var results = Arr.map(fields, function (field) {
        return doExtractOne(path, obj, field, strength);
      });

      return ResultCombine.consolidateObj(results, {});
    };

    var doExtractOne = function (path, obj, field, strength) {
      return field.fold(
        // prop
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

        // obj
        function (key, okey, presence, fields) {
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
        function (key, okey, presence, fields) {
          var grouping = function (arrayData) {
            var extracted = Arr.map(arrayData, function (ad, i) {
              return doExtract(path.concat([ key + '[' + i + ']' ]), fields, strength);
            });

            // Now, with the array of results, consolidate them into a Result array
            var conslidated = ResultCombine.consolidateArr(extracted);
            return conslidated.map(function (c) {
              return ObjWriter.wrap(okey, strength(c));
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

        // state
        function (okey, instantiator) {
          var v = instantiator(obj);
          return Result.value(ObjWriter.wrap(okey, strength(v)));
        }
      );
    };

    var extract = function (path, obj, fields, strength) {
      var extracted = doExtract(path, obj, fields, strength);
      return extracted.fold(function (errs) {
        throw new Error('Invalid attempt to read: ' + Json.stringify(obj) + '.xx\n' + errs.join('\n'));
      }, Fun.identity);
    };

    var weak = function (path, obj, fields) {
      return extract(path, obj, fields, Fun.identity);
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