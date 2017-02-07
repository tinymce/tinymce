define(
  'ephox.boulder.core.ValueProcessor',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.Objects',
    'ephox.boulder.combine.ResultCombine',
    'ephox.boulder.core.ObjReader',
    'ephox.boulder.core.ObjWriter',
    'ephox.boulder.core.SchemaError',
    'ephox.boulder.format.TypeTokens',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.lumber.api.Timers',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'ephox.scullion.ADT'
  ],

  function (FieldPresence, Objects, ResultCombine, ObjReader, ObjWriter, SchemaError, TypeTokens, Arr, Obj, Merger, Timers, Fun, Option, Result, Adt) {
    var adt = Adt.generate([
      { field: [ 'key', 'okey', 'presence', 'prop' ] },
      { state: [ 'okey', 'instantiator' ] }
    ]);

    var output = function (okey, value) {
      return adt.state(okey, Fun.constant(value));
    };

    var snapshot = function (okey) {
      return adt.state(okey, Fun.identity);
    };

  
    var strictAccess = function (path, obj, key) {
      // In strict mode, if it undefined, it is an error.
      return ObjReader.readOptFrom(obj, key).fold(function () {
        return SchemaError.missingStrict(path, key, obj);
      }, Result.value);
    };

    var fallbackAccess = function (obj, key, fallbackThunk) {
      var v = ObjReader.readOptFrom(obj, key).fold(function () {
        return fallbackThunk();
      }, Fun.identity);
      return Result.value(v);
    };

    var optionAccess = function (obj, key) {
      return Result.value(ObjReader.readOptFrom(obj, key));
    };

    var optionDefaultedAccess = function (obj, key, fallback) {
      var opt = ObjReader.readOptFrom(obj, key).map(function (val) {
        return val === true ? fallback : val;
      });
      return Result.value(opt);
    };

    var cExtractOne = function (path, obj, field, strength) {
      return field.fold(
        function (key, okey, presence, prop) {
          var bundle = function (av) {
            return prop.extract(path.concat([ key ]), strength, av).map(function (res) {
              return ObjWriter.wrap(okey, strength(res));
            });
          };

          var bundleAsOption = function (optValue) {
            return optValue.fold(function () {
              var outcome = ObjWriter.wrap(okey, strength(Option.none()));
              return Result.value(outcome);
            }, function (ov) {
              return prop.extract(path.concat([ key ]), strength, ov).map(function (res) {
                return ObjWriter.wrap(okey, strength(Option.some(res)));
              });
            });
          };

          return (function () {
            return presence.fold(function () {
              return strictAccess(path, obj, key).bind(bundle);
            }, function (fallbackThunk) {
              return fallbackAccess(obj, key, fallbackThunk).bind(bundle);
            }, function () {
              return optionAccess(obj, key).bind(bundleAsOption);
            }, function (fallbackThunk) {
              // Defaulted option access
              return optionDefaultedAccess(obj, key, fallbackThunk).bind(bundleAsOption);
            }, function (baseThunk) {
              var base = baseThunk();
              return fallbackAccess(obj, key, Fun.constant({})).map(function (v) {
                return Merger.deepMerge(base, v);
              }).bind(bundle);
            });
          })();
        },
        function (okey, instantiator) {
          var state = instantiator(obj);
          return Result.value(ObjWriter.wrap(okey, strength(state)));
        }
      );
    };

    var cExtract = function (path, obj, fields, strength) {
      if (obj === undefined) {
        return SchemaError.custom(path, 'Obj was undefined');
      }

       var results = Arr.map(fields, function (field) {
        return cExtractOne(path, obj, field, strength);
      });

      return Timers.run('cExtract.consolidateObj', function () {
        return ResultCombine.consolidateObj(results, {});
      });
    };

    var value = function (validator) {
      var extract = function (path, strength, val) {
        return validator(val).fold(function (err) {
          return SchemaError.custom(path, err);
        }, Result.value); // ignore strength
      };

      var toString = function () {
        return 'val';
      };

      var toDsl = function () {
        return TypeTokens.typeAdt.itemOf(validator);
      };

      return {
        extract: extract,
        toString: toString,
        toDsl: toDsl
      };      
    };

    var objOnly = function (fields) {
      var delegate = obj(fields);

      var fieldNames = Arr.foldr(fields, function (acc, f) {
        return f.fold(function (key) {
          return Merger.deepMerge(acc, Objects.wrap(f, true));
        }, Fun.constant(acc));
      }, { });

      var extract = function (path, strength, o) {
        var keys = Obj.keys(o);
        var extra = Arr.filter(keys, function (k) {
          return !Objects.hasKey(fieldNames, k);
        });

        return extra.length === 0  ? delegate.extract(path, strength, o) : 
          SchemaError.unsupportedFields(path, extra);
      };

      return {
        extract: extract,
        toString: delegate.toString,
        toDsl: delegate.toDsl
      };
    };

    var obj = function (fields) {
      var extract = function (path, strength, o) {
        return cExtract(path, o, fields, strength);
      };

      var toString = function () {
        var fieldStrings = Arr.map(fields, function (field) {
          return field.fold(function (key, okey, presence, prop) {
            return key + ' -> ' + prop.toString();
          }, function (okey, instantiator) {
            return 'state(' + okey + ')';
          });
        });
        return 'obj{\n' + fieldStrings.join('\n') + '}'; 
      };

      var toDsl = function () {
        return TypeTokens.typeAdt.objOf(
          Arr.map(fields, function (f) {
            return f.fold(function (key, okey, presence, prop) {
              return TypeTokens.fieldAdt.field(key, presence, prop);
            }, function (okey, instantiator) {
              return TypeTokens.fieldAdt.state(okey);
            });
          })
        );
      };

      return {
        extract: extract,
        toString: toString,
        toDsl: toDsl
      };
    };

    var arr = function (prop) {
      var extract = function (path, strength, array) {
        var results = Arr.map(array, function (a, i) {
          return prop.extract(path.concat(['[' + i + ']' ]), strength, a);
        });
        return ResultCombine.consolidateArr(results);
      };

      var toString = function () {
        return 'array(' + prop.toString() + ')';
      };

      var toDsl = function () {
        return TypeTokens.typeAdt.arrOf(prop);
      };

      return {
        extract: extract,
        toString: toString,
        toDsl: toDsl
      };
    };

    var setOf = function (validator, prop) {
      var validateKeys = function (path, keys) {
        return arr(value(validator)).extract(path, Fun.identity, keys);
      };
      var extract = function (path, strength, o) {
        // 
        var keys = Obj.keys(o);
        return validateKeys(path, keys).bind(function (validKeys) {
          var schema = Arr.map(validKeys, function (vk) {
            return adt.field(vk, vk, FieldPresence.strict(), prop);
          });

          return obj(schema).extract(path, strength, o);
        });
      };

      var toString = function () {
        return 'setOf(' + prop.toString() + ')';
      };

      var toDsl = function () {
        return TypeTokens.typeAdt.setOf(validator, prop);
      }

      return {
        extract: extract,
        toString: toString,
        toDsl: toDsl
      };
    };

    var anyValue = value(Result.value);

    var arrOfObj = Fun.compose(arr, obj);

    return {
      anyValue: Fun.constant(anyValue),

      value: value,
      obj: obj,
      objOnly: objOnly,
      arr: arr,
      setOf: setOf,

      arrOfObj: arrOfObj,

      state: adt.state,

      field: adt.field,
      
      output: output,
      snapshot: snapshot
    };
  }
);

