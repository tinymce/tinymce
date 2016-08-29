define(
  'ephox.katamari.api.FutureResults',

  [
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Result'
  ],

  function (Future, Result) {
    /*
     * bindFuture :: (
     *   fResult :: FutureResult a
     *   f :: a -> FutureResult b
     * ) -> FutureResult b     
     */
    var bindFuture = function (fResult, f) {
      // If we are a result error, keep the error
      return fResult.bind(function (res) {
        return res.fold(function () {
          return Future.pure(res);
        }, function (value) {
          return f(value);
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
      return fResult.bind(function (res) {
        return res.map(function (a) {
          return f(a);
        });
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
      return fResult.bind(function (res) {
        return res.map(function (a) {
          var b = f(a);
          return Result.value(b);
        });
      });
    };

    return {
      bindFuture: bindFuture,
      bindResult: bindResult,
      mapResult: mapResult
    };
  }
);