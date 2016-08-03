define(
  'ephox.boulder.core.ObjChanger',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var narrow = function (obj, fields) {
      var r = { };
      Arr.each(fields, function (field) {
        if (obj[field] !== undefined) r[field] = obj[field];
      });

      return r;
    };

    return {
      narrow: narrow
    };
  }
);