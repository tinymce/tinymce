asynctest(
  'FutureResultsTest',

  [
    'ephox.katamari.api.Future',
    'ephox.katamari.api.FutureResult',
    'ephox.katamari.api.Result',
    'global!Promise'
  ],

  function (Future, FutureResult, Result, Promise) {
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

    var testFromResult = function () {
      return new Promise(function (resolve, reject) {
        FutureResult.fromResult(Result.error('future.from.result.error')).get(function (res) {
          res.fold(function (err) {
            assert.eq('future.from.result.error', err);
            resolve(true);
          }, function (val) {
            reject('testFromResult:error: Unexpected success: ' + val);
          });
        });
      });
    };

    var testFromFuture = function () {
      return new Promise(function (resolve, reject) {
        FutureResult.fromFuture(Future.pure('future.from.future')).get(function (res) {
          res.fold(function (err) {
            reject('testFromFuture: Unexpected error: ' + err);
          }, function (val) {
            assert.eq('future.from.future', val);
            resolve(true);
          });
        });
      });
    };

    var testNu = function () {
      return new Promise(function (resolve, reject) {
        FutureResult.nu(function (callback) {
          callback(
            Result.value('future.nu')
          );
        }).get(function (res) {
          res.fold(function (err) {
            reject('testNu: Unexpected error: ' + err);
          }, function (val) {
            assert.eq('future.nu', val);
            resolve(true);
          });
        });
      });
    };

    testPure().then(testError).then(testFromResult).then(testFromFuture).then(testNu).then(function () {
      success();
    }, failure);
  }
);