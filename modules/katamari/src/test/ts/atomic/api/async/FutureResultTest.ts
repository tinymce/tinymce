/* tslint:disable:no-unimported-promise */
import { Future } from 'ephox/katamari/api/Future';
import { FutureResult } from 'ephox/katamari/api/FutureResult';
import { Result } from 'ephox/katamari/api/Result';
import * as Fun from 'ephox/katamari/api/Fun';
import fc from 'fast-check';
import { tResult } from 'ephox/katamari/api/ResultInstances';
import { Testable } from '@ephox/dispute';
import { arbResult } from 'ephox/katamari/test/arb/ArbDataTypes';
import { eqAsync, promiseTest } from 'ephox/katamari/test/AsyncProps';

type Testable<A> = Testable.Testable<A>;
const { tNumber } = Testable;

promiseTest('FutureResult: nu', () => fc.assert(fc.asyncProperty(arbResult(fc.integer(), fc.integer()), (r) => new Promise((resolve, reject) => {
  FutureResult.nu((completer) => {
    completer(r);
  }).get((ii) => {
    eqAsync('eq', r, ii, reject, tResult());
    resolve();
  });
}))));

promiseTest('FutureResult: fromFuture', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
  FutureResult.fromFuture<number, unknown>(Future.pure(i)).get((ii) => {
    eqAsync('eq', Result.value(i), ii, reject, tResult());
    resolve();
  });
}))));

promiseTest('FutureResult: wrap get', () => fc.assert(fc.asyncProperty(arbResult(fc.integer(), fc.integer()), (r) => new Promise((resolve, reject) => {
  FutureResult.wrap(Future.pure(r)).get((ii) => {
    eqAsync('eq', r, ii, reject, tResult());
    resolve();
  });
}))));

promiseTest('FutureResult: fromResult get', () => fc.assert(fc.asyncProperty(arbResult(fc.integer(), fc.integer()), (r) => new Promise((resolve, reject) => {
  FutureResult.fromResult(r).get((ii) => {
    eqAsync('eq', r, ii, reject, tResult());
    resolve();
  });
}))));

promiseTest('FutureResult: pure get', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
  FutureResult.pure<number, unknown>(i).get((ii) => {
    eqAsync('eq', Result.value(i), ii, reject, tResult());
    resolve();
  });
}))));

promiseTest('FutureResult: value get', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
  FutureResult.value<number, unknown>(i).get((ii) => {
    eqAsync('eq', Result.value(i), ii, reject, tResult());
    resolve();
  });
}))));

promiseTest('FutureResult: error get', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
  FutureResult.error<unknown, number>(i).get((ii) => {
    eqAsync('eq', Result.error(i), ii, reject, tResult());
    resolve();
  });
}))));

promiseTest('FutureResult: value mapResult', () => {
  const f = (x) => x + 3;
  return fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    FutureResult.value(i).mapResult(f).get((ii) => {
      eqAsync('eq', Result.value(f(i)), ii, reject, tResult());
      resolve();
    });
  })));
});

promiseTest('FutureResult: error mapResult', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
  FutureResult.error(i).mapResult(Fun.die('⊥')).get((ii) => {
    eqAsync('eq', Result.error(i), ii, reject, tResult());
    resolve();
  });
}))));

promiseTest('FutureResult: value mapError', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
  FutureResult.value(i).mapError(Fun.die('⊥')).get((ii) => {
    eqAsync('eq', Result.value(i), ii, reject, tResult());
    resolve();
  });
}))));

promiseTest('FutureResult: err mapError', () => {
  const f = (x) => x + 3;
  return fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    FutureResult.error(i).mapError(f).get((ii) => {
      eqAsync('eq', Result.error(f(i)), ii, reject, tResult());
      resolve();
    });
  })));
});

promiseTest('FutureResult: value bindFuture value', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
  const f = (x) => x % 4;
  FutureResult.value(i).bindFuture((x) => FutureResult.value(f(x))).get((actual) => {
    eqAsync('bind result', Result.value(f(i)), actual, reject, tResult(tNumber));
    resolve();
  });
}))));

promiseTest('FutureResult: bindFuture: value bindFuture error', () => fc.assert(fc.asyncProperty(fc.integer(), fc.string(), (i, s) => new Promise((resolve, reject) => {
  FutureResult.value(i).bindFuture(() => FutureResult.error(s)).get((actual) => {
    eqAsync('bind result', Result.error(s), actual, reject, tResult(tNumber));
    resolve();
  });
}))));

promiseTest('FutureResult: error bindFuture', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
  FutureResult.error(i).bindFuture(Fun.die('⊥')).get((actual) => {
    eqAsync('bind result', Result.error(i), actual, reject, tResult(tNumber));
    resolve();
  });
}))));
