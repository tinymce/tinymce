define(
  'ephox.katamari.async.AsyncValues',

  [
    'ephox.katamari.api.Arr'
  ],

  function (Arr) {
    /* 
     * NOTE: an `asyncValue` must have a `get` function which gets given a callback and calls 
     * that callback with a value once it is ready
     *
     * e.g 
     * {
     *   get: function (callback) { callback(10); }
     * }
     */
    var par = function (asyncValues, nu) {
      return nu(function(callback) {
        var r = [];
        var count = 0;

        var cb = function(i) {
          return function(value) {
            r[i] = value;
            count++;
            if (count >= asyncValues.length) {
              callback(r);
            }
          };
        };

        if (asyncValues.length === 0) {
          callback([]);
        } else {
          Arr.each(asyncValues, function(asyncValue, i) {
            asyncValue.get(cb(i));
          });
        }
      });
    };

    return {
      par: par
    };
  }
);