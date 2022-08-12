import { describe, it } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import { Future } from 'ephox/katamari/api/Future';
import { FutureResult } from 'ephox/katamari/api/FutureResult';
import { Result } from 'ephox/katamari/api/Result';
import { tResult } from 'ephox/katamari/api/ResultInstances';
import { arbResult } from 'ephox/katamari/test/arb/ArbDataTypes';
import { eqAsync } from 'ephox/katamari/test/AsyncProps';

type Testable<A> = Testable.Testable<A>;
const { tNumber } = Testable;

describe('atomic.katamari.ap.async.FutureResultTest', () => {
  it('nu', () => fc.assert(fc.asyncProperty(arbResult(fc.integer(), fc.integer()), (r) => new Promise((resolve, reject) => {
    FutureResult.nu((completer) => {
      completer(r);
    }).get((ii) => {
      eqAsync('eq', r, ii, reject, tResult());
      resolve();
    });
  }))));

  it('fromFuture', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    FutureResult.fromFuture(Future.pure(i)).get((ii) => {
      eqAsync('eq', Result.value(i), ii, reject, tResult());
      resolve();
    });
  }))));

  it('wrap get', () => fc.assert(fc.asyncProperty(arbResult(fc.integer(), fc.integer()), (r) => new Promise((resolve, reject) => {
    FutureResult.wrap(Future.pure(r)).get((ii) => {
      eqAsync('eq', r, ii, reject, tResult());
      resolve();
    });
  }))));

  it('fromResult get', () => fc.assert(fc.asyncProperty(arbResult(fc.integer(), fc.integer()), (r) => new Promise((resolve, reject) => {
    FutureResult.fromResult(r).get((ii) => {
      eqAsync('eq', r, ii, reject, tResult());
      resolve();
    });
  }))));

  it('pure get', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    FutureResult.pure<number, unknown>(i).get((ii) => {
      eqAsync('eq', Result.value(i), ii, reject, tResult());
      resolve();
    });
  }))));

  it('value get', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    FutureResult.value<number, unknown>(i).get((ii) => {
      eqAsync('eq', Result.value(i), ii, reject, tResult());
      resolve();
    });
  }))));

  it('error get', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    FutureResult.error<unknown, number>(i).get((ii) => {
      eqAsync('eq', Result.error(i), ii, reject, tResult());
      resolve();
    });
  }))));

  it('value mapResult', () => {
    const f = (x: number) => x + 3;
    return fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
      FutureResult.value(i).mapResult(f).get((ii) => {
        eqAsync('eq', Result.value(f(i)), ii, reject, tResult());
        resolve();
      });
    })));
  });

  it('error mapResult', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    FutureResult.error(i).mapResult(Fun.die('should not be called')).get((ii) => {
      eqAsync('eq', Result.error(i), ii, reject, tResult());
      resolve();
    });
  }))));

  it('value mapError', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    FutureResult.value(i).mapError(Fun.die('should not be called')).get((ii) => {
      eqAsync('eq', Result.value(i), ii, reject, tResult());
      resolve();
    });
  }))));

  it('err mapError', () => {
    const f = (x: number) => x + 3;
    return fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
      FutureResult.error(i).mapError(f).get((ii) => {
        eqAsync('eq', Result.error(f(i)), ii, reject, tResult());
        resolve();
      });
    })));
  });

  it('value bindFuture value', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    const f = (x: number) => x % 4;
    FutureResult.value(i).bindFuture((x) => FutureResult.value(f(x))).get((actual) => {
      eqAsync('bind result', Result.value(f(i)), actual, reject, tResult(tNumber));
      resolve();
    });
  }))));

  it('bindFuture: value bindFuture error', () => fc.assert(fc.asyncProperty(fc.integer(), fc.string(), (i, s) => new Promise((resolve, reject) => {
    FutureResult.value(i).bindFuture(() => FutureResult.error(s)).get((actual) => {
      eqAsync('bind result', Result.error(s), actual, reject, tResult(tNumber));
      resolve();
    });
  }))));

  it('error bindFuture', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    FutureResult.error(i).bindFuture<never>(Fun.die('should not be called')).get((actual) => {
      eqAsync('bind result', Result.error(i), actual, reject, tResult(tNumber));
      resolve();
    });
  }))));
});
