/* tslint:disable:no-unimported-promise */
import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { LazyValue } from 'ephox/katamari/api/LazyValue';
import * as LazyValues from 'ephox/katamari/api/LazyValues';
import { Result } from 'ephox/katamari/api/Result';
import * as AsyncProps from 'ephox/katamari/test/AsyncProps';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';
import { setTimeout } from '@ephox/dom-globals';

UnitTest.asynctest('LazyValueTest', (success, failure) => {

  const lazyCounter = function () {
    let counter = 0;
    return LazyValue.nu(function (callback) {
      counter++;
      callback(counter);
    });
  };

  const testGet = function () {
    return new Promise(function (resolve, reject) {
      const lazy = lazyCounter();

      lazy.get(function (val) {
        if (! Jsc.eq(val, 1)) {
          reject('LazyValue.get. The counter should be 1 after 1 call');
        } else {
          lazy.get(function (val2) {
            if (Jsc.eq(val2, 1)) {
              resolve(true);
            } else {
              reject('LazyValue.get. The counter should still be 1 because it is cached. Was: ' + val2);
            }
          });
        }
      });
    });
  };

  const testMap = function () {
    return new Promise(function (resolve, reject) {
      const f = function (x) {
        return x + 'hello';
      };

      const lazy = LazyValue.nu(function (callback) {
        setTimeout(function () {
          callback('extra');
        }, 10);
      });

      lazy.map(f).get(function (fx) {
        return Jsc.eq(fx, 'extrahello') ? resolve(true) : reject('LazyValue.map. Expected: extrahello, was: ' + fx);
      });
    });
  };

  const testIsReady = function () {
    return new Promise(function (resolve, reject) {
      const lazy = LazyValue.nu(function (callback) {
        setTimeout(function () {
          callback('extra');
        }, 50);
      });

      if (lazy.isReady()) {
        reject('LazyValue.isReady. Lazy value should not be ready yet.');
      } else {
        lazy.get(function (v) {
          if (! lazy.isReady()) {
            reject('LazyValue.isReady. Lazy value should now be ready');
          } else {
            resolve(true);
          }
        });
      }
    });
  };

  const testPure = function () {
    return new Promise(function (resolve, reject) {
      LazyValue.pure(10).get(function (v) {
        return Jsc.eq(10, v) ? resolve(true) : reject('LazyValue.pure. Expected 10, was: ' + v);
      });
    });
  };

  const testParallel = function () {
    return new Promise(function (resolve, reject) {
      const f = LazyValue.nu(function (callback) {
        setTimeout(Fun.curry(callback, 'apple'), 10);
      });
      const g = LazyValue.nu(function (callback) {
        setTimeout(Fun.curry(callback, 'banana'), 5);
      });
      const h = LazyValue.nu(function (callback) {
        callback('carrot');
      });

      LazyValues.par([f, g, h]).get(function (r) {
        assert.eq(r[0], 'apple');
        assert.eq(r[1], 'banana');
        assert.eq(r[2], 'carrot');
        resolve(true);
      });
    });
  };

  const testSpecs = function () {
    const genLazySchema = Jsc.json.generator.map(function (json) {
      const lazyValue = LazyValue.nu(function (done) {
        setTimeout(function () {
          done(json);
        }, 10);
      });

      return {
        lazyValue,
        contents: json
      };
    });

    const arbLazySchema = Jsc.bless({
      generator: genLazySchema
    });

    return AsyncProps.checkProps([
      {
        label: 'LazyValue.pure resolves with data',
        arbs: [ Jsc.json ],
        f (json) {
          return AsyncProps.checkLazy(LazyValue.pure(json), function (data) {
            return Jsc.eq(json, data) ? Result.value(true) : Result.error('Payload is not the same');
          });
        }
      },

      {
        label: 'LazyValue.pure map f resolves with f data',
        arbs: [ Jsc.json, Jsc.fun(Jsc.json) ],
        f (json, f) {
          return AsyncProps.checkLazy(LazyValue.pure(json).map(f), function (data) {
            return Jsc.eq(f(json), data) ? Result.value(true) : Result.error('f(json) !== data');
          });
        }
      },

      {
        label: 'LazyValues.par([lazyvalue]).get() === [lazyvalue.val]',
        arbs: [ Jsc.array(arbLazySchema) ],
        f (lvs: Array<{lazyValue: LazyValue<any>, contents: any}>) {
          const rawLazyvals = Arr.map(lvs, function (ft) { return ft.lazyValue; });
          const expected = Arr.map(lvs, function (ft) { return ft.contents; });
          return AsyncProps.checkLazy(LazyValues.par(rawLazyvals), function (list) {
            return Jsc.eq(expected, list) ? Result.value(true) : Result.error(
              'Expected: ' + expected.join(',') + ', actual: ' + list.join(',')
            );
          });
        }
      }
    ]);
  };

  testGet().then(testMap).then(testIsReady).then(testPure).then(testParallel).
    then(testSpecs).then(function () {
    success();
  }, failure);
});
