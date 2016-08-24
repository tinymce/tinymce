define(
  'ephox.katamari.api.Futures',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Future'
  ],

  function (Arr, Future) {
    /** [Future a] -> Future [a] */
    var par = function(futures) {
      return Future.nu(function(callback) {
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

    /** Kleisli composition of two functions: a -> Future b.
     *  Note the order of arguments: g is invoked first, then the result passed to f.
     *  This is in line with f . g = \x -> f (g a)
     *
     *  compose :: ((b -> Future c), (a -> Future b)) -> a -> Future c
     */
    var compose = function (f, g) {
      return function (a) {
        return g(a).bind(f);
      };
    };

    return {
      par: par,
      mapM: mapM,
      compose: compose
    };
  }
);