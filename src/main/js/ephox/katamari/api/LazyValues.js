define(
  'ephox.katamari.api.LazyValues',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.LazyValue'
  ],

  function (Arr, LazyValue) {
    /** [LazyValue a] -> LazyValue [a] */

    // Note: duplication with Futures.par
    var par = function (lazyValues) {
      return LazyValue.nu(function(callback) {
        var r = [];
        var count = 0;

        var cb = function(i) {
          return function(value) {
            r[i] = value;
            count++;
            if (count >= lazyValues.length) {
              callback(r);
            }
          };
        };

        if (lazyValues.length === 0) {
          callback([]);
        } else {
          Arr.each(lazyValues, function(future, i) {
            future.get(cb(i));
          });
        }
      });
    };

    return {
      par: par
    };
  }
);