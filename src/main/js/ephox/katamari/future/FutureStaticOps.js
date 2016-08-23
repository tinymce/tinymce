define(
  'ephox.katamari.future.FutureStaticOps',

  [
    'ephox.katamari.api.Arr'
  ],

  function (Arr) {
    return function(nu) {
      /** a -> Future a */
      var pure = function(a) {
        return nu(function(callback) {
          callback(a);
        });
      };

      /** [Future a] -> Future [a] */
      var par = function(futures) {
        return nu(function(callback) {
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
      var mapM = function(as, fn) {
        return par(Arr.map(as, fn));
      };

      /** Kleisli composition of two functions: a -> Future b.
       *  Note the order of arguments: g is invoked first, then the result passed to f.
       *  This is in line with f . g = \x -> f (g a)
       *
       *  compose :: ((b -> Future c), (a -> Future b)) -> a -> Future c
       */
      var compose = function(f, g) {
        return function(a) {
          return g(a).bind(f);
        };
      };

      return {
        nu: nu,
        pure: pure,
        par: par,
        mapM: mapM,
        compose: compose
      };
    };
  }
);
