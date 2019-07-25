import { setTimeout } from '@ephox/dom-globals';
import Promise from '@ephox/wrap-promise-polyfill';
import { LazyValue } from './LazyValue';

export interface Future<T> {
  map: <U> (mapper: (v: T) => U) => Future<U>;
  bind: <U> (binder: (v: T) => Future<U>) => Future<U>;
  anonBind: <U> (thunk: Future<U>) => Future<U>;
  toLazy: () => LazyValue<T>;
  toCached: () => Future<T>;
  toPromise: () => Promise<T>;
  get: (callback: (v: T) => void) => void;
}

const errorReporter = function (err: any) {
  // we can not throw the error in the reporter as it will just be black-holed
  // by the Promise so we use a setTimeout to escape the Promise.
  setTimeout(() => {
    throw err;
  }, 0);
};

const make = function <T = any>(run: () => Promise<T>): Future<T> {

  const get = function (callback: (value: T) => void) {
    run().then(callback, errorReporter);
  };

  /** map :: this Future a -> (a -> b) -> Future b */
  const map = function <U>(fab: (v: T) => U) {
    return make(() => run().then(fab));
  };

  /** bind :: this Future a -> (a -> Future b) -> Future b */
  const bind = function <U>(aFutureB: (v: T) => Future<U>) {
    return make(() => run().then((v) => aFutureB(v).toPromise()));
  };

  /** anonBind :: this Future a -> Future b -> Future b
   *  Returns a future, which evaluates the first future, ignores the result, then evaluates the second.
   */
  const anonBind = function <U>(futureB: Future<U>) {
    return make(() => run().then(() => futureB.toPromise()));
  };

  const toLazy = function () {
    return LazyValue.nu(get);
  };

  const toCached = function () {
    let cache: Promise<T> | null = null;
    return make(() => {
      if (cache === null) {
        cache = run();
      }
      return cache;
    });
  };

  const toPromise = run;

  return {
    map,
    bind,
    anonBind,
    toLazy,
    toCached,
    toPromise,
    get
  };

};

const nu = function <T = any>(baseFn: (completer: (value?: T) => void) => void): Future<T> {
  return make(() => new Promise(baseFn));
};

/** a -> Future a */
const pure = function <T>(a: T) {
  return make(() => Promise.resolve(a));
};

export const Future = {
  nu,
  pure
};
