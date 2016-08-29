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

      /*
       * bindFuture :: (
       *   f :: a -> FutureResult b
       * ) -> FutureResult b     
       */
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

      /*
       * bindResult :: (
       *   fResult :: FutureResult a
       *   f :: a -> Result b
       * ) -> FutureResult b     
       */
      var bindResult = function (fResult, f) {
        // If we are a result error, keep the error
        return fResult.map(function (resA) {
          return resA.bind(f);
        });
      };

      /*
       * mapResult :: (
       *   fResult :: FutureResult a
       *   f :: a -> b
       * ) -> FutureResult b     
       */
      var mapResult = function (fResult, f) {
        // If we are a result error, keep the error
        return fResult.map(function (res) {
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