import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { Future } from 'ephox/katamari/api/Future';
import * as Futures from 'ephox/katamari/api/Futures';
import { Result } from 'ephox/katamari/api/Result';
import * as AsyncProps from 'ephox/katamari/test/AsyncProps';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';
import { setTimeout } from '@ephox/dom-globals';

UnitTest.asynctest('FutureTest', (success, failure) => {

  const testPure = function () {
    return new Promise(function (resolve, reject) {
      Future.pure('hello').get(function(a) {
        assert.eq('hello', a);
        resolve(true);
      });
    });
  };

  const testGet = function () {
    return new Promise(function (resolve, reject) {
      Future.nu(function(callback) {
        setTimeout(Fun.curry(callback, 'blah'), 10);
      }).get(function(a) {
        assert.eq('blah', a);
        resolve(true);
      });
    });
  };

  const testMap = function () {
    return new Promise(function (resolve, reject) {
      const fut = Future.nu(function(callback) {
        setTimeout(Fun.curry(callback, 'blah'), 10);
      });

      const f = function(x) {
        return x + 'hello';
      };

      fut.map(f).get(function(a) {
        assert.eq('blahhello', a);
        resolve(true);
      });
    });
  };

  const testBind = function () {
    return new Promise(function (resolve, reject) {
      const fut = Future.nu(function(callback) {
        setTimeout(Fun.curry(callback, 'blah'), 10);
      });

      const f = function(x) {
        return Future.nu(function(callback) {
          callback(x + 'hello');
        });
      };

      fut.bind(f).get(function(a) {
        assert.eq('blahhello', a);
        resolve(true);
      });
    });
  };

  const testAnonBind = function () {
    return new Promise(function (resolve, reject) {
      let called = false;

      const fut = Future.nu(function(callback) {
        called = true;
        setTimeout(Fun.curry(callback, 'blah'), 10);
      });

      const f = Future.nu(function(callback) {
        callback('hello');
      });

      fut.anonBind(f).get(function(a) {
        assert.eq('hello', a);
        assert.eq(true, called);
        resolve(true);
      });
    });
  };

  const testParallel = function () {
    return new Promise(function (resolve, reject) {
      const f = Future.nu(function(callback) {
        setTimeout(Fun.curry(callback, 'apple'), 10);
      });
      const g = Future.nu(function(callback) {
        setTimeout(Fun.curry(callback, 'banana'), 5);
      });
      const h = Future.nu(function(callback) {
        callback('carrot');
      });


      Futures.par([f, g, h]).get(function(r){
        assert.eq(r[0], 'apple');
        assert.eq(r[1], 'banana');
        assert.eq(r[2], 'carrot');
        resolve(true);
      });
    });
  };

  const testMapM = function () {
    return new Promise(function (resolve, reject) {
      const fn = function(a) {
        return Future.nu(function(cb) {
          setTimeout(Fun.curry(cb, a + ' bizarro'), 10);
        });
      };

      Futures.mapM(['q', 'r', 's'], fn).get(function(r){
        assert.eq(['q bizarro', 'r bizarro', 's bizarro'], r);
        resolve(true);
      });

    });
  };

  const testCompose = function () {
    return new Promise(function (resolve, reject) {
      const f = function(a) {
        return Future.nu(function(cb) {
          setTimeout(Fun.curry(cb, a + ' f'), 10);
        });
      };

      const g = function(a) {
        return Future.nu(function(cb) {
          setTimeout(Fun.curry(cb, a + ' g'), 10);
        });
      };

      Futures.compose(f, g)('a').get(function(r) {
        assert.eq('a g f', r);
        resolve(true);
      });
    });
  };

  const testCache = function () {
    return new Promise(function(resolve, reject) {
      let callCount = 0;
      const future = Future.nu(function(cb) {
        callCount++;
        setTimeout(Fun.curry(cb, callCount), 10);
      });
      const cachedFuture = future.toCached();

      assert.eq(0, callCount);
      cachedFuture.get(function(r) {
        assert.eq(1, r);
        assert.eq(1, callCount);
        cachedFuture.get(function(r2) {
          assert.eq(1, r2);
          assert.eq(1, callCount);
          resolve(true);
        });
      });
    });
  };

  const testSpecs = function () {
    const genFutureSchema = Jsc.json.generator.map(function (json) {
      const future = Future.nu(function (done) {
        setTimeout(function () {
          done(json);
        }, 10);
      });

      return {
        future: future,
        contents: json
      };
    });

    const genFuture = Jsc.json.generator.map(function (json) {
      return Future.nu(function (done) {
        setTimeout(function () {
          done(json);
        }, 10);
      });
    });

    const arbFuture = Jsc.bless({
      generator: genFuture
    });

    const arbFutureSchema = Jsc.bless({
      generator: genFutureSchema
    });

    return AsyncProps.checkProps([
      {
        label: 'Future.pure resolves with data',
        arbs: [ Jsc.json ],
        f: function (json) {
          return AsyncProps.checkFuture(Future.pure(json), function (data) {
            return Jsc.eq(json, data) ? Result.value(true) : Result.error('Payload is not the same');
          });
        }
      },

      {
        label: 'Future.pure map f resolves with f data',
        arbs: [ Jsc.json, Jsc.fun(Jsc.json) ],
        f: function (json, f) {
          return AsyncProps.checkFuture(Future.pure(json).map(f), function (data) {
            return Jsc.eq(f(json), data) ? Result.value(true) : Result.error('f(json) !== data');
          });
        }
      },

      {
        label: 'future.bind(binder) equiv future.get(bind)',
        arbs: [ arbFutureSchema, Jsc.fun(arbFuture) ],
        f: function (arbF, binder) {
          return AsyncProps.futureToPromise(arbF.future.bind(binder)).then(function (data) {
            return new Promise(function (resolve, reject) {
              binder(arbF.contents).toLazy().get(function (bInitial) {
                return Jsc.eq(data, bInitial) ? resolve(true): reject('Data did not match');
              });
            });
          });
        }
      },

      {
        label: 'futures.par([future]).get() === [future.val]',
        arbs: [ Jsc.array(arbFutureSchema) ],
        f: function (futures) {
          const rawFutures = Arr.map(futures, function (ft) { return ft.future; });
          const expected = Arr.map(futures, function (ft) { return ft.contents; });
          return AsyncProps.checkFuture(Futures.par(rawFutures), function (list) {
            return Jsc.eq(expected, list) ? Result.value(true) : Result.error(
              'Expected: ' + expected.join(',') +', actual: ' + list.join(',')
            );
          });
        }
      },

      {
        label: 'futures.mapM([json], json -> future).get(length) === [json].length',
        arbs: [ Jsc.array(arbFuture), Jsc.fun(arbFuture) ],
        f: function (inputs, g) {
          const fResult = Futures.mapM(inputs, g);
          return AsyncProps.checkFuture(fResult, function (list) {
            return Jsc.eq(inputs.length, list.length) ? Result.value(true) : Result.error('input length was not the same as output length');
          });
        }
      }
    ]);
  };

  testPure().then(testGet).then(testMap).then(testBind).then(testAnonBind).
    then(testParallel).then(testMapM).then(testCompose).then(testCache).
    then(testSpecs).then(function () {
    success();
  }, failure);
});

