define(
  'ephox.boulder.api.ValueProcessor',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldValidation',
    'ephox.boulder.api.ObjProcessor',
    'ephox.boulder.api.ObjReader',
    'ephox.boulder.api.ObjWriter',
    'ephox.boulder.combine.ResultCombine',
    'ephox.compass.Arr',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.scullion.ADT'
  ],

  function (FieldPresence, FieldValidation, ObjProcessor, ObjReader, ObjWriter, ResultCombine, Arr, Json, Fun, Result, Adt) {
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

    var strict = function (key) {
      return adt.field(key, key, FieldPresence.strict(), value(Result.value));
    };

    var defaulted = function (key, fallback) {
      return adt.field(key, key, FieldPresence.defaulted(fallback), value(Result.value));
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


    var cExtractOne = function (path, obj, field, strength) {
      console.log('field', field);
      return field.fold(
        function (key, okey, presence, prop) {
          var access = (function () {
            return presence.fold(function () {
              return strictAccess(path.concat([ key ]), obj, key);
            }, function (fallback) {
              return fallbackAccess(obj, key, fallback);
            }, function () {
              return optionAccess(obj, key);
            });
          })();

          console.log('prop', prop);

          return access.bind(function (av) {
            console.log('weak.av', av);
            return prop.extract(strength, av).map(function (res) {
              return ObjWriter.wrap(okey, res);
            });
          });
        },
        function (okey, instantiator) {
          var state = instantiator(obj);
          return ObjWriter.wrap(okey, strength(state));
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
      var strong = function (val) {
        return validator(val).map(Fun.constant);
      };

      var weak = function (val) {
        return validator(val);
      };

      var extract = function (strength, val) {
        return validator(val).map(strength);
      };

      var toString = function () {
        return 'val';
      };

      return {
        strong: strong,
        weak: weak,
        validate: Fun.noop,
        extract: extract,
        toString: toString
      };      
    };

    var obj = function (path, fields) {
      var weak = function (obj) {
        return cExtract(path, obj, fields, Fun.identity);
      };

      var strong = function (obj) {
        return cExtract(path, obj, fields, Fun.constant);
      };

      var extract = function (strength, obj) {
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

      // Do the toString.
      // var toString = function () {
      //   return 'obj{\n' + 
      //     Arr.map(fields, function (field) {
      //       return fi
      //     })
      // }

      return {
        weak: weak,
        strong: strong,
        validate: Fun.noop,
        extract: extract,
        toString: toString
      };
    };

    var arr = function (prop) {
      var strong = function (array) {
        var results = Arr.map(array, prop.strong);
        return Fun.constant(ResultCombine.consolidateArr(results));
      };

      var weak = function (array) {
        var results = Arr.map(array, prop.weak);
        return ResultCombine.consolidateArr(results);
      };

      var extract = function (strength, array) {
        var results = Arr.map(array, Fun.curry(prop.extract, strength));
        return strength(ResultCombine.consolidateArr(results));
      };

      var toString = function () {
        return 'array(' + prop.toString() + ')';
      };

      return {
        strong: strong,
        weak: weak,
        validate: Fun.noop,
        extract: extract,
        toString: toString
      };
    };

    var arrOfObj = function (path, fields) {
      return arr(obj(path, fields));
    };

    return {
      value: value,
      obj: obj,
      arr: arr,

      arrOfObj: arrOfObj,

      prop: adt.prop,
      // obj: adt.obj,
      // arr: adt.arr,
      state: adt.state,

      field: adt.field,
      
      output: output,
      snapshot: snapshot,
      strict: strict,
      defaulted: defaulted
    };
  }
);

