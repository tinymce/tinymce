define(
  'ephox.katamari.future.Futures',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.future.FutureValue'
  ],

  function (Arr, FutureValue) {
    /** [Future a] -> Future [a] */
    var par = function(futures) {
      return FutureValue(function(callback) {
        var r = [];
        var count = 0;

        var cb = function(i) {
          return function(value) {
            r[i] = value;
            count++;
            if (count >= futures.length) {
              callback(r);
            }
          };
        };

        if (futures.length === 0) {
          callback([]);
        } else {
          Arr.each(futures, function(future, i) {
            future.get(cb(i));
          });
        }
      });
    };

    /** [a] -> (a -> Future b) -> Future [b] */
    var mapM = function(array, fn) {
      var futures = Arr.map(array, fn);
      return par(futures);
    };

    return {
      par: par,
      mapM: mapM
    };
  }
);