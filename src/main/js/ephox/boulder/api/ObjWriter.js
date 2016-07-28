define(
  'ephox.boulder.api.ObjWriter',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var wrap = function (key, value) {
      var r = {};
      r[key] = value;
      return r;
    };

    var wrapAll = function (keyvalues) {
      var r = {};
      Arr.each(keyvalues, function (kv) {
        r[kv.key] = kv.value;
      });
      return r;
    };


    return {
      wrap: wrap,
      wrapAll: wrapAll
    };
  }
);