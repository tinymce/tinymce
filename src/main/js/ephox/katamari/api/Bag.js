define(
  'ephox.katamari.api.Bag',

  [
    'ephox.katamari.api.Arr',
    'global!Array'
  ],

  function (Arr, Array) {
    var equal = function (v1, v2) {
      var copy = Array.prototype.slice.call(v1, 0);
      if (v1.length !== v2.length) return false;
      
      for (var i = 0; i < v2.length; i++) {
        var index = Arr.indexOf(copy, v2[i]);
        if (index > -1) {
          copy.splice(index, 1);
        } else {
          return false;
        }
      }
      return true;
    };

    return {
      equal: equal
    };
  }
);