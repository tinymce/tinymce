define(
  'ephox.katamari.api.Future',

  [
    'ephox.katamari.future.FutureValue',
    'ephox.katamari.future.Futures'
  ],

  /** A future value that is evaluated on demand. The base function is re-evaluated each time 'get' is called. */
  function (FutureValue, Futures) {
    var nu = function (callback) {
      return FutureValue(callback);
    };

    /** a -> Future a */
    var pure = function(a) {
      return nu(function(callback) {
        callback(a);
      });
    };

    /** [Future a] -> Future [a] **/
    var par = function (futures) {
      return Futures.par(futures);
    };

    /** [a] -> (a -> Future b) -> Future [b] */
    var mapM = function (array, fn) {
      return Futures.mapM(array, fn);
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
      nu: nu,
      pure: pure,
      par: par,
      mapM: mapM,
      compose: compose
    };
  }
);
