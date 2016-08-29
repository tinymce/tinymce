asynctest(
  'FutureResultsTest',

  [
    'ephox.katamari.api.Future',
    'ephox.katamari.api.FutureResult',
    'ephox.katamari.api.Result',
    'ephox.katamari.test.AsyncProps',
    'ephox.katamari.test.arb.ArbDataTypes',
    'ephox.wrap.Jsc',
    'global!Promise'
  ],

  function (Future, FutureResult, Result, AsyncProps, ArbDataTypes, Jsc, Promise) {
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

    var testBindFuture = function () {
      return new Promise(function (resolve, reject) {
        var fut = FutureResult.pure('10');

        var f = function (x) {
          return FutureResult.pure(x + '.bind.future');
        };

        fut.bindFuture(f).get(function (output) {
          var value = output.getOrDie();
          assert.eq('10.bind.future', value);
          resolve(true);
        });
      });
    };

    var testBindResult = function () {
      return new Promise(function (resolve, reject) {
        var fut = FutureResult.pure('10');

        var f = function (x) {
          return Result.value(x + '.bind.result');
        };

        fut.bindResult(f).get(function (output) {
          var value = output.getOrDie();
          assert.eq('10.bind.result', value);
          resolve(true);
        });
      });
    };

    var testMapResult = function () {
      return new Promise(function (resolve, reject) {
        var fut = FutureResult.pure('10');

        var f = function (x) {
          return x + '.map.result';
        };

        fut.mapResult(f).get(function (output) {
          var value = output.getOrDie();
          assert.eq('10.map.result', value);
          resolve(true);
        });
      });
    };


    var testSpecs = function () {
      return AsyncProps.checkProps([
        {
          label: 'FutureResult.pure resolves with data',
          arbs: [ Jsc.json ],
          f: function (json) {
            return AsyncProps.checkFuture(FutureResult.pure(json), function (data) {
              return data.fold(function (err) {
                return Result.error('Unexpected error in test: ' + err);
              }, function (value) {
                return Jsc.eq(json, value) ? Result.value(true) : Result.error('Payload is not the same');  
              });              
            });
          }       
        },

        {
          label: 'FutureResult.pure mapResult f resolves with f data',
          arbs: [ Jsc.json, Jsc.fun(Jsc.json) ],
          f: function (json, f) {
            var futureResult = FutureResult.pure(json);
            return AsyncProps.checkFuture(futureResult.mapResult(f), function (data) {
              return data.fold(function (err) {
                return Result.error('Should not have failed: ' + err);
              }, function (val) {
                return Jsc.eq(f(json), val) ? Result.value(true) : Result.error('f(json) !== mapResult(f)');
              });
            });
          }
        },

        {
          label: 'futureResult.bind(binder) equiv futureResult.get(bind)',
          arbs: [ ArbDataTypes.futureResultSchema, Jsc.fun(ArbDataTypes.futureResult) ],
          f: function (arbF, binder) {
            return AsyncProps.futureToPromise(arbF.futureResult.bindFuture(binder)).then(function (data) {
              return new Promise(function (resolve, reject) {
                binder(arbF.contents).toLazy().get(function (bInitial) {
                  return bInitial.fold(function (bErr) {
                    return data.fold(function (dErr) {
                      console.log('bErr', bErr);
                      console.log('dErr', dErr);
                      return Jsc.eq(bErr, dErr) ? resolve(true) : reject('errors did not match');
                    }, function (dVal) {
                      reject('Did not get the expected error. Was instead value: ' + dVal);
                    });
                  }, function (bVal) {
                    return data.fold(function (dErr) {
                      reject('Did not get expected value. Was instead error: ' + dErr);
                    }, function (dVal) {
                      return Jsc.eq(bVal, bVal) ? resolve(true): reject('Data did not match');
                    });
                  });                  
                });
              });
            });
          }
        }
      ]);
    };

    testPure().then(testError).then(testFromResult).then(testFromFuture).then(testNu).
      then(testBindResult).then(testBindFuture).then(testMapResult).then(testSpecs).then(function () {
      success();
    }, failure);
  }
);