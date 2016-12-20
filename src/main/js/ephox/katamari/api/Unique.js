define(
  'ephox.katamari.api.Unique',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj'
  ],

  function (Arr, Obj) {
    var stringArray = function(a) {
      var all = {};
      Arr.each(a, function(key) {
        all[key] = {};
      });
      return Obj.keys(all);
    };

    return {
      stringArray: stringArray
    };
  }
);
