define(
  'ephox.boulder.core.ObjChanger',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var narrow = function (obj, fields) {
      var r = { };
      Arr.each(fields, function (field) {
        if (obj[field] !== undefined && obj.hasOwnProperty(field)) r[field] = obj[field];
      });

      return r;
    };

    var indexOnKey = function (array, key) {
      var obj = { };
      Arr.each(array, function (a) {
        // FIX: Work out what to do here.
        var keyValue = a[key];
        obj[keyValue] = a;
      });
      return obj;
    };

    return {
      narrow: narrow,
      indexOnKey: indexOnKey
    };
  }
);