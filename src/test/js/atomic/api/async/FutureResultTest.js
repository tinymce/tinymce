asynctest(
  'FutureResultsTest',

  [
    'ephox.katamari.api.FutureResult',
    'global!Promise'
  ],

  function (FutureResult, Promise) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var testPure = function () {
      return new Promise(function (resolve, reject) {
        FutureResult.pure('future.result.hello').get(function (res) {
          res.fold(function (err) {
            reject('testPure: Unexpected error: ' + err);
          }, function (val) {
            assert.eq('future.result.hello', val);
            resolve(true);
          });
        });
      });
    };

    var testError = function () {
      return new Promise(function (resolve, reject) {
        FutureResult.error('future.result.error').get(function (res) {
          res.fold(function (err) {
            assert.eq('future.result.error', err);
            resolve(true);
          }, function (val) {
            reject('testError: Unexpected success: ' + val);
          });
        });
      });
    };

    // return {
    //   pure: pure,
    //   error: error,
    //   fromResult: fromResult,
    //   fromFuture: fromFuture,
    //   nu: nu
    // };

    testPure().then(testError).then(function () {
      success();
    }, failure);
  }
);