define(
  'ephox.boulder.api.ValueProcessor',

  [
    'ephox.boulder.api.ObjProcessor',
    'ephox.boulder.combine.ResultCombine',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result'
  ],

  function (ObjProcessor, ResultCombine, Arr, Fun, Result) {
    var value = function (validator) {
      var strong = function (val) {
        return Fun.constant(Result.value(val));
      };

      var weak = function (val) {
        return Result.value(val);
      };

      return {
        strong: strong,
        weak: weak,
        validate: Fun.noop
      };      
    };

    var obj = function (fields) {
      return ObjProcessor.group([ 'JsValue.obj' ], fields);
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
      arr: arr
    };
  }
);