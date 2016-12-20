define(
  'ephox.agar.api.GroupStore',

  [
    'ephox.katamari.api.Merger'
  ],

  function (Merger) {
    return function () {
      var data = {};

      var record = function (prop, elem) {
        var d = data[prop] !== undefined ? data[prop] : [ ];
        d = d.concat(elem);
        data[prop] = d;
      };

      var get = function () {
        return Merger.deepMerge({}, data);
      };

      return {
        record: record,
        get: get
      };
    };
  }
);