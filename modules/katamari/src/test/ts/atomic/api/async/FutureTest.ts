/* tslint:disable:no-unimported-promise */
import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { Future } from 'ephox/katamari/api/Future';
import * as Futures from 'ephox/katamari/api/Futures';
import { promiseTest, eqAsync } from 'ephox/katamari/test/AsyncProps';
import { setTimeout } from '@ephox/dom-globals';
import fc from 'fast-check';
import { Testable } from '@ephox/dispute';

const { tNumber, tString, tArray } = Testable;

promiseTest('Future: pure get', () =>
  fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    Future.pure(i).get((ii) => {
      eqAsync('pure get', i, ii, reject, tNumber);
      resolve();
    });
  }))));

promiseTest('Future: future soon get', () =>
  fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    Future.nu((cb) => {
      setTimeout(() => {
        cb(i);
      }, 3);
    }).get((ii) => {
      eqAsync('get', i, ii, reject, tNumber);
      resolve();
    });
  }))));

promiseTest('Future: map', () =>
  fc.assert(fc.asyncProperty(fc.integer(), fc.func(fc.string()), (i, f) => new Promise((resolve, reject) => {
    Future.pure(i).map(f).get((ii) => {
      eqAsync('get', f(i), ii, reject, tString);
      resolve();
    });
  }))));

promiseTest('Future: bind', () =>
  fc.assert(fc.asyncProperty(fc.integer(), fc.func(fc.string()), (i, f) => new Promise((resolve, reject) => {
    Future.pure(i).bind(Fun.compose(Future.pure, f)).get((ii) => {
      eqAsync('get', f(i), ii, reject, tString);
      resolve();
    });
  }))));

promiseTest('Future: anonBind', () =>
  fc.assert(fc.asyncProperty(fc.integer(), fc.string(), (i, s) => new Promise((resolve, reject) => {
    Future.pure(i).anonBind(Future.pure(s)).get((ii) => {
      eqAsync('get', s, ii, reject, tString);
      resolve();
    });
  }))));

promiseTest('Future: parallel', () => new Promise(function (resolve, reject) {
  const f = Future.nu(function (callback) {
    setTimeout(Fun.curry(callback, 'apple'), 10);
  });
  const g = Future.nu(function (callback) {
    setTimeout(Fun.curry(callback, 'banana'), 5);
  });
  const h = Future.nu(function (callback) {
    callback('carrot');
  });

  Futures.par([ f, g, h ]).get(function (r) {
    eqAsync('r[0]', r[0], 'apple', reject);
    eqAsync('r[1]', r[1], 'banana', reject);
    eqAsync('r[2]', r[2], 'carrot', reject);
    resolve(true);
  });
}));

promiseTest('Future: parallel spec', () =>
  fc.assert(fc.asyncProperty(fc.array(fc.tuple(fc.integer(1, 10), fc.integer())), (tuples) => new Promise((resolve, reject) => {
    Futures.par(Arr.map(tuples, ([ timeout, value ]) => Future.nu((cb) => {
      setTimeout(() => {
        cb(value);
      }, timeout);
    }))).get((ii) => {
      eqAsync('pars', tuples.map(([ _, i ]) => i), ii, reject, tArray(tNumber));
      resolve();
    });
  })))
);

promiseTest('Future: mapM', function () {
  return new Promise(function (resolve, reject) {
    const fn = function (a) {
      return Future.nu(function (cb) {
        setTimeout(Fun.curry(cb, a + ' bizarro'), 10);
      });
    };

    Futures.traverse([ 'q', 'r', 's' ], fn).get(function (r) {
      eqAsync('eq', [ 'q bizarro', 'r bizarro', 's bizarro' ], r, reject);
      resolve();
    });
  });
});

promiseTest('Future: mapM spec', () =>
  fc.assert(fc.asyncProperty(fc.array(fc.tuple(fc.integer(1, 10), fc.integer())), (tuples) => new Promise((resolve, reject) => {
    Futures.mapM(tuples, ([ timeout, value ]) => Future.nu((cb) => {
      setTimeout(() => {
        cb(value);
      }, timeout);
    })).get((ii) => {
      eqAsync('pars', tuples.map(([ _, i ]) => i), ii, reject, tArray(tNumber));
      resolve();
    });
  })))
);

promiseTest('Future: compose', function () {
  return new Promise(function (resolve, reject) {
    const f = function (a) {
      return Future.nu(function (cb) {
        setTimeout(Fun.curry(cb, a + ' f'), 10);
      });
    };

    const g = function (a) {
      return Future.nu(function (cb) {
        setTimeout(Fun.curry(cb, a + ' g'), 10);
      });
    };

    Futures.compose(f, g)('a').get(function (r) {
      eqAsync('compose', 'a g f', r, reject);
      resolve(true);
    });
  });
});

promiseTest('Future: cache', function () {
  return new Promise(function (resolve, reject) {
    let callCount = 0;
    const future = Future.nu(function (cb) {
      callCount++;
      setTimeout(Fun.curry(cb, callCount), 10);
    });
    const cachedFuture = future.toCached();

    eqAsync('eq', 0, callCount, reject);
    cachedFuture.get(function (r) {
      eqAsync('eq', 1, r, reject);
      eqAsync('eq', 1, callCount, reject);
      cachedFuture.get(function (r2) {
        eqAsync('eq', 1, r2, reject);
        eqAsync('eq', 1, callCount, reject);
        resolve();
      });
    });
  });
});
