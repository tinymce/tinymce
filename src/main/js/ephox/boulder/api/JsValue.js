define(
  'ephox.boulder.api.JsValue',

  [
    'ephox.boulder.api.ObjProcessor',
    'ephox.boulder.combine.ResultCombine',
    'ephox.compass.Arr',
    'ephox.perhaps.Result'
  ],

  function (ObjProcessor, ResultCombine, Arr, Result) {
    var value = function (validator) {
      return function (jsValue) {
        return Result.value(jsValue);
      };      
    };

    var obj = function (fields) {
      return function (obj) {
        var x = ObjProcessor.group([ 'obj' ], fields).weak(obj);
        console.log('x', x, obj);

        return Result.value(x);
      };
    };

    var arr = function (prop) {
      return function (array) {
        var results = Arr.map(array, prop);
        return ResultCombine.consolidateArr(results);
      };
    };

    return {
      value: value,
      obj: obj,
      arr: arr
    };
  }
);