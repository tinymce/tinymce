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
      return adt.field(key, key, FieldPresence.strict(), value(FieldValidation.none()));
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

          return access.bind(function (value) {
            console.log('weak.value', value);
            return prop.weak(value).map(function (res) {
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

      return {
        strong: strong,
        weak: weak,
        validate: Fun.noop
      };      
    };

    var obj = function (path, fields) {
      var weak = function (obj) {
        return cExtract(path, obj, fields, Fun.identity);
      };

      var strong = function (obj) {
        return ObjProcessor.extract(path, obj, fields, Fun.constant);
      };

      return {
        weak: weak,
        strong: strong,
        validate: Fun.noop
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

      return {
        strong: strong,
        weak: weak,
        validate: Fun.noop
      };
    };

    return {
      value: value,
      obj: obj,
      arr: arr,

      prop: adt.prop,
      // obj: adt.obj,
      // arr: adt.arr,
      state: adt.state,

      field: adt.field,
      
      output: output,
      snapshot: snapshot,
      strict: strict
    };
  }
);

