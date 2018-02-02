import { Future } from 'ephox/katamari/api/Future';
import { FutureResult } from 'ephox/katamari/api/FutureResult';
import { Result } from 'ephox/katamari/api/Result';
import Results from 'ephox/katamari/api/Results';
import AsyncProps from 'ephox/katamari/test/AsyncProps';
import ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.asynctest('FutureResultsTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var testPure = function () {
    return new Promise(function (resolve, reject) {
      FutureResult.value('future.result.hello').get(function (res) {
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
      var fut = FutureResult.value('10');

      var f = function (x: string) {
        return FutureResult.value(x + '.bind.future');
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
      var fut = FutureResult.value('10');

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
      var fut = FutureResult.value('10');

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
        label: 'FutureResult.value resolves with data',
        arbs: [ Jsc.json ],
        f: function (json) {
          return AsyncProps.checkFuture(FutureResult.value(json), function (data) {
            return data.fold(function (err) {
              return Result.error('Unexpected error in test: ' + err);
            }, function (value) {
              return Jsc.eq(json, value) ? Result.value(true) : Result.error('Payload is not the same');  
            });              
          });
        }       
      },

      {
        label: 'FutureResult.value mapResult f resolves with f data',
        arbs: [ Jsc.json, Jsc.fun(Jsc.json) ],
        f: function (json, f) {
          var futureResult = FutureResult.value(json);
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

              var comparison = Results.compare(arbF.contents, data);
              comparison.match({
                // input was error
                // bind result was error
                // so check that the error strings are the same (i.e. binder didn't run)
                bothErrors: function (errInit, errBind) {
                  return Jsc.eq(errInit, errBind) ? resolve(true) : reject('Both were errors, but the errors did not match');
                },

                // input was error
                // bind result was value
                // something is wrong.
                firstError: function (errInit, valBind) {
                  reject('Initially, you had an error, but after bind you received a value');
                },

                // input was value
                // bind result was error
                // something is right if binder(value) === error
                secondError: function (valInit, errBind) {
                  // check that bind did not do that.
                  binder(valInit).toLazy().get(function (resF) {
                    resF.fold(function (errF) {
                      // binding original value resulted in error, so check error
                      return Jsc.eq(errBind, errF) ? resolve(true) : reject('Both bind results were errors, but the errors did not match');
                    }, function (valF) {
                      // binding original value resulted in value, so this path is wrong
                      reject('After binding the value, bindFuture should be a value, but it is an error');
                    });
                  });
                },
                bothValues: function (valInit, valBind) {
                  // input was value
                  // bind result was value
                  // something is right if binder(value) === value
                  binder(valInit).toLazy().get(function (resF) {
                    resF.fold(function (errF) {
                      reject(
                        'After binding the value, bindFuture should be a error: ' + errF + ', but was value: ' + valBind
                      );
                    }, function (valF) {
                      return Jsc.eq(valBind, valF) ? resolve(true) : reject(
                        'Both bind results were values, but the values did not match\n' +
                        'First: ' + valBind + '\n' +
                        'Second: ' + valF
                      );
                    });
                  });
                }
              });
            });
          });
        }
      },
      {
        label: 'futureResult.bindResult equiv binding original value',
        arbs: [ ArbDataTypes.futureResultSchema, Jsc.fun(ArbDataTypes.result) ],
        f: function (arbF, resultBinder) {
          return AsyncProps.futureToPromise(arbF.futureResult.bindResult(resultBinder)).then(function (data) {
            return new Promise(function (resolve, reject) {
              var comparison = Results.compare(arbF.contents, data);
              comparison.match({
                // input was error
                // bind result was error
                // so check that the error strings are the same (i.e. binder didn't run)
                bothErrors: function (errInit, errBind) {
                  return Jsc.eq(errInit, errBind) ? resolve(true) : reject('Both were errors, but the errors did not match');
                },

                // input was error
                // bind result was value
                // something is wrong.
                firstError: function (errInit, valBind) {
                  reject('Initially, you had an error, but after bind you received a value');
                },

                // input was value
                // bind result was error
                // something is right if binder(value) === error
                secondError: function (valInit, errBind) {
                  // check that bind did not do that.
                  resultBinder(valInit).fold(function (errF) {
                    // binding original value resulted in error, so check error
                    return Jsc.eq(errBind, errF) ? resolve(true) : reject('Both bind results were errors, but the errors did not match');
                  }, function (valF) {
                    // binding original value resulted in value, so this path is wrong
                    reject('After binding the value, bindFuture should be a value, but it is an error');
                  });
                },
                bothValues: function (valInit, valBind) {
                  // input was value
                  // bind result was value
                  // something is right if binder(value) === value
                  resultBinder(valInit).fold(function (errF) {
                    reject(
                      'After binding the value, bindFuture should be a error: ' + errF + ', but was value: ' + valBind
                    );
                  }, function (valF) {
                    return Jsc.eq(valBind, valF) ? resolve(true) : reject(
                      'Both bind results were values, but the values did not match\n' +
                      'First: ' + valBind + '\n' +
                      'Second: ' + valF
                    );
                  });
                }
              });
            });
          });
        }
      },

      {
        label: 'futureResult.mapResult equiv mapping original result',
        arbs: [ ArbDataTypes.futureResultSchema, Jsc.fun(ArbDataTypes.json) ],
        f: function (arbF, resultMapper) {
          return AsyncProps.futureToPromise(arbF.futureResult.mapResult(resultMapper)).then(function (data) {
            return new Promise(function (resolve, reject) {
              var comparison = Results.compare(arbF.contents, data);
              comparison.match({
                // input was error
                // bind result was error
                // so check that the error strings are the same (i.e. binder didn't run)
                bothErrors: function (errInit, errBind) {
                  return Jsc.eq(errInit, errBind) ? resolve(true) : reject('Both were errors, but the errors did not match');
                },

                // input was error
                // bind result was value
                // something is wrong.
                firstError: function (errInit, valBind) {
                  reject('Initially, you had an error, but after bind you received a value');
                },

                // input was value
                // bind result was error
                // something is wrong because you can't map to an error
                secondError: function (valInit, errBind) {
                  reject('Initially you had a value, so you cannot map to an error');
                },
                bothValues: function (valInit, valBind) {
                  // input was value
                  // bind result was value
                  // something is right if mapper(value) === value
                  var valF = resultMapper(valInit);
                  return Jsc.eq(valBind, valF) ? resolve(true) : reject(
                    'Mapper results did not match\n' +
                    'First: ' + valBind + '\n' +
                    'Second: ' + valF
                  );
                }
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
});

