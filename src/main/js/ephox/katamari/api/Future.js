define(
  'ephox.katamari.api.Future',

  [
    'ephox.katamari.future.Bounce',
    'ephox.katamari.future.FutureOps',
    'ephox.katamari.future.FutureStaticOps'
  ],

  /** A future value that is evaluated on demand. The base function is re-evaluated each time 'get' is called. */
  function (Bounce, FutureOps, FutureStaticOps) {

    // TODO: Make the exports clearer

    // baseFn is a function(callback) { ... }
    var nu = function(baseFn) {

      var get = function(callback) {
        baseFn(Bounce.bounce(callback));
      };

      return FutureOps(nu, get);
    };

    return FutureStaticOps(nu);
  }
);
