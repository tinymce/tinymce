define(
  'ephox.katamari.api.FutureResult',

  [
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Result'
  ],

  function (Future, Result) {
    var fromResult = function (result) {
      return Future.pure(result);
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

    var nu = function (callback) {
      return Future.nu(callback);
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