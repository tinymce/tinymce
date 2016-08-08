define(
  'ephox.boulder.core.ValueProcessor',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.combine.ResultCombine',
    'ephox.boulder.core.ObjReader',
    'ephox.boulder.core.ObjWriter',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'ephox.scullion.ADT'
  ],

  function (FieldPresence, ResultCombine, ObjReader, ObjWriter, Arr, Obj, Merger, Json, Fun, Option, Result, Adt) {
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
            }, function (fallback) {
              return fallbackAccess(obj, key, fallback).bind(bundle);
            }, function () {
              return optionAccess(obj, key).bind(bundleAsOption);
            }, function (fallback) {
              // Defaulted option access
              return optionDefaultedAccess(obj, key, fallback).bind(bundleAsOption);
            }, function (other) {
              return fallbackAccess(obj, key, {}).map(function (v) {
                return Merger.deepMerge(other, v);
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
       var results = Arr.map(fields, function (field) {
        return cExtractOne(path, obj, field, strength);
      });

      return ResultCombine.consolidateObj(results, {});
    };

    var value = function (validator) {
      var extract = function (path, strength, val) {
        return validator(val).fold(function (err) {
          return Result.error('Path: ' + path.join(' > ') + '\n' + err);
        }, Result.value); // ignore strength
      };

      var toString = function () {
        return 'val';
      };

      return {
        extract: extract,
        toString: toString
      };      
    };

    var obj = function (fields) {
      var extract = function (path, strength, obj) {
        return cExtract(path, obj, fields, strength);
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

      return {
        extract: extract,
        toString: toString
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

      return {
        extract: extract,
        toString: toString
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

      return {
        extract: extract,
        toString: toString
      };
    };

    var anyValue = value(Result.value);

    var arrOfObj = Fun.compose(arr, obj);

    return {
      anyValue: Fun.constant(anyValue),

      value: value,
      obj: obj,
      arr: arr,
      setOf: setOf,

      arrOfObj: arrOfObj,

      prop: adt.prop,
      // obj: adt.obj,
      // arr: adt.arr,
      state: adt.state,

      field: adt.field,
      
      output: output,
      snapshot: snapshot
    };
  }
);

