define(
  'ephox.katamari.api.CachedFuture',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger',
    'ephox.katamari.future.FutureOps',
    'ephox.katamari.future.FutureStaticOps',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Option',
    'global!setTimeout'
  ],

  /**
   *  A future value.
   *  The base function is evaluated eagerly, and only evaluated once.
   *  Each call to 'get' queues a callback, which is invoked when the value is available.
   */
  function (Arr, Merger, FutureOps, FutureStaticOps, Future, Option, setTimeout) {

    // f is a function(callback) { ... }
    var nu = function (baseFn) {

      var data = Option.none();
      var callbacks = [];

      var get = function (callback) {
        isSet() ? call(callback) : callbacks.push(callback);
      };

      var set = function (x) {
        data = Option.some(x);
        run(callbacks);
        callbacks = [];
      };

      var isSet = function() {
        return data.isSome();
      };

      var run = function (cbs) {
        Arr.each(cbs, call);
      };

      var call = function(cb) {
        data.each(function(x) {
          setTimeout(function() {
            cb(x);
          }, 0);
        });
      };

      Future.nu(baseFn).get(set);

      var ops = FutureOps(nu, get);

      return Merger.merge(ops, {
        isSet: isSet
      });
    };

    return FutureStaticOps(nu);
  }
);
