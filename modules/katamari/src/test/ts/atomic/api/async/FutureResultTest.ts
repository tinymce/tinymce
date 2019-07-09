/* tslint:disable:no-unimported-promise */
import { Future } from 'ephox/katamari/api/Future';
import { FutureResult } from 'ephox/katamari/api/FutureResult';
import { Result } from 'ephox/katamari/api/Result';
import * as Fun from 'ephox/katamari/api/Fun';
import * as Results from 'ephox/katamari/api/Results';
import * as AsyncProps from 'ephox/katamari/test/AsyncProps';
import * as ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.asynctest('FutureResultsTest', (success, failure) => {

  const testPure = function () {
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

  const testError = function () {
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

  const testFromResult = function () {
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

  const testFromFuture = function () {
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

  const testNu = function () {
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

  const testBindFuture = function () {
    return new Promise(function (resolve, reject) {
      const fut = FutureResult.value('10');

      const f = function (x: string) {
        return FutureResult.value(x + '.bind.future');
      };

      fut.bindFuture(f).get(function (output) {
        const value = output.getOrDie();
        assert.eq('10.bind.future', value);
        resolve(true);
      });
    });
  };

  const testBindFutureError = function () {
    return new Promise(function (resolve, reject) {
      let count = 0;

      const fut = FutureResult.nu((callback) => {
        count++;
        callback(Result.error('error'));
      });

      const f = function (x: string) {
        assert.fail('Should never be invoked');
        return FutureResult.value(x + '.bind.future');
      };

      fut.bindFuture(f).get(function (output) {
        assert.eq(1, count, 'should only be invoked once not twice');
        output.fold(
          (err) => assert.eq('error', err, 'should contain an error result'),
          (_) => assert.fail('Should never be invoked')
        );

        resolve(true);
      });
    });
  };

  const testBindResult = function () {
    return new Promise(function (resolve, reject) {
      const fut = FutureResult.value('10');

      const f = function (x) {
        return Result.value(x + '.bind.result');
      };

      fut.bindResult(f).get(function (output) {
        const value = output.getOrDie();
        assert.eq('10.bind.result', value);
        resolve(true);
      });
    });
  };

  const testMapResult = function () {
    return new Promise(function (resolve, reject) {
      const fut = FutureResult.value('10');

      const f = function (x) {
        return x + '.map.result';
      };

      fut.mapResult(f).get(function (output) {
        const value = output.getOrDie();
        assert.eq('10.map.result', value);
        resolve(true);
      });
    });
  };

  const testMapError = function () {
    return new Promise(function (resolve, reject) {
      const fut = FutureResult.error('10');

      const f = function (x) {
        return x + '.map.result';
      };

      fut.mapError(f).get(function (output) {
        const error = output.fold(Fun.identity, Fun.identity);
        assert.eq('10.map.result', error);
        resolve(true);
      });
    });
  };

  const testSpecs = function () {
    return AsyncProps.checkProps([
      {
        label: 'FutureResult.value resolves with data',
        arbs: [ Jsc.json ],
        f (json) {
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
        f (json, f) {
          const futureResult = FutureResult.value(json);
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
        f (arbF, binder) {
          return AsyncProps.futureToPromise(arbF.futureResult.bindFuture(binder)).then(function (data) {
            return new Promise(function (resolve, reject) {

              const comparison = Results.compare(arbF.contents, data);
              comparison.match({
                // input was error
                // bind result was error
                // so check that the error strings are the same (i.e. binder didn't run)
                bothErrors (errInit, errBind) {
                  return Jsc.eq(errInit, errBind) ? resolve(true) : reject('Both were errors, but the errors did not match');
                },

                // input was error
                // bind result was value
                // something is wrong.
                firstError (errInit, valBind) {
                  reject('Initially, you had an error, but after bind you received a value');
                },

                // input was value
                // bind result was error
                // something is right if binder(value) === error
                secondError (valInit, errBind) {
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
                bothValues (valInit, valBind) {
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
        f (arbF, resultBinder) {
          return AsyncProps.futureToPromise(arbF.futureResult.bindResult(resultBinder)).then(function (data) {
            return new Promise(function (resolve, reject) {
              const comparison = Results.compare(arbF.contents, data);
              comparison.match({
                // input was error
                // bind result was error
                // so check that the error strings are the same (i.e. binder didn't run)
                bothErrors (errInit, errBind) {
                  return Jsc.eq(errInit, errBind) ? resolve(true) : reject('Both were errors, but the errors did not match');
                },

                // input was error
                // bind result was value
                // something is wrong.
                firstError (errInit, valBind) {
                  reject('Initially, you had an error, but after bind you received a value');
                },

                // input was value
                // bind result was error
                // something is right if binder(value) === error
                secondError (valInit, errBind) {
                  // check that bind did not do that.
                  resultBinder(valInit).fold(function (errF) {
                    // binding original value resulted in error, so check error
                    return Jsc.eq(errBind, errF) ? resolve(true) : reject('Both bind results were errors, but the errors did not match');
                  }, function (valF) {
                    // binding original value resulted in value, so this path is wrong
                    reject('After binding the value, bindFuture should be a value, but it is an error');
                  });
                },
                bothValues (valInit, valBind) {
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
        arbs: [ ArbDataTypes.futureResultSchema, Jsc.fun(Jsc.json) ],
        f (arbF, resultMapper) {
          return AsyncProps.futureToPromise(arbF.futureResult.mapResult(resultMapper)).then(function (data) {
            return new Promise(function (resolve, reject) {
              const comparison = Results.compare(arbF.contents, data);
              comparison.match({
                // input was error
                // bind result was error
                // so check that the error strings are the same (i.e. binder didn't run)
                bothErrors (errInit, errBind) {
                  return Jsc.eq(errInit, errBind) ? resolve(true) : reject('Both were errors, but the errors did not match');
                },

                // input was error
                // bind result was value
                // something is wrong.
                firstError (errInit, valBind) {
                  reject('Initially, you had an error, but after bind you received a value');
                },

                // input was value
                // bind result was error
                // something is wrong because you can't map to an error
                secondError (valInit, errBind) {
                  reject('Initially you had a value, so you cannot map to an error');
                },
                bothValues (valInit, valBind) {
                  // input was value
                  // bind result was value
                  // something is right if mapper(value) === value
                  const valF = resultMapper(valInit);
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

  testPure()
    .then(testBindFutureError)
    .then(testError)
    .then(testFromResult)
    .then(testFromFuture)
    .then(testNu)
    .then(testBindResult)
    .then(testBindFuture)
    .then(testMapResult)
    .then(testMapError)
    .then(testSpecs)
    .then(function () {
      success();
    }, failure);
});
