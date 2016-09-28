define(
  'ephox.katamari.api.FutureResult',

  [
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Result'
  ],

  function (Future, Result) {
    var fromResult = function (result) {
      return nu(function (callback) {
        callback(result);
      });
    };

    var fromFuture = function (future) {
      return future.map(Result.value);
    };

    var error = function (message) {
      return fromResult(Result.error(message));
    };

    var pure = function (value) {
      return fromResult(Result.value(value));
    };

    var nu = function (baseFn) {
      // FutureResult a
      var delegate = Future.nu(baseFn);

      /** bindFuture :: this FutureResult a -> (a -> FutureResult b) -> FutureResult b */
      var bindFuture = function (f) {
        // If we are a result error, keep the error
        return delegate.bind(function (resA) {
          return resA.fold(function () {
            return delegate;
          }, function (a) {
            return f(a);
          });
        });
      };

      /* bindResult :: this FutureResult a -> (a -> Result b) -> FutureResult b */
      var bindResult = function (f) {
        // If we are a result error, keep the error
        return delegate.map(function (resA) {
          return resA.bind(f);
        });
      };

      /* mapResult :: this FutureResult a -> (a -> b) -> FutureResult b */
      var mapResult = function (f) {
        // If we are a result error, keep the error
        return delegate.map(function (res) {
          return res.map(f);
        });
      };

      return {
        bindFuture: bindFuture,
        bindResult: bindResult,
        mapResult: mapResult,
        toLazy: delegate.toLazy,
        get: delegate.get
      };
    };

    return {
      pure: pure,
      error: error,
      fromResult: fromResult,
      fromFuture: fromFuture,
      nu: nu
    };
  }
);