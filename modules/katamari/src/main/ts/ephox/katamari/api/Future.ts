import { LazyValue } from './LazyValue';
import * as Bounce from '../async/Bounce';

export interface Future<T> {
  map: <U> (mapper: (v: T) => U) => Future<U>;
  bind: <U> (binder: (v: T) => Future<U>) => Future<U>;
  anonBind: <U> (thunk: Future<U>) => Future<U>;
  toLazy: () => LazyValue<T>;
  toCached: () => Future<T>;
  get: (callback: (v: T) => void) => void;
};

const nu = function <T = any> (baseFn: (completer: (value?: T) => void) => void) : Future<T> {
  const get = function(callback: (value: T) => void) {
    baseFn(Bounce.bounce(callback));
  };

  /** map :: this Future a -> (a -> b) -> Future b */
  const map = function <U> (fab: (v: T) => U) {
    return nu(function (callback: (value: U) => void) {
      get(function (a) {
        const value = fab(a);
        callback(value);
      });
    });
  };

  /** bind :: this Future a -> (a -> Future b) -> Future b */
  const bind = function <U> (aFutureB: (v: T) => Future<U>) {
    return nu(function (callback: (value: U) => void) {
      get(function (a) {
        aFutureB(a).get(callback);
      });
    });
  };

  /** anonBind :: this Future a -> Future b -> Future b
   *  Returns a future, which evaluates the first future, ignores the result, then evaluates the second.
   */
  const anonBind = function <U> (futureB: Future<U>) {
    return nu(function (callback: (value: U) => void) {
      get(function (a) {
        futureB.get(callback);
      });
    });
  };

  const toLazy = function () {
    return LazyValue.nu(get);
  };

  const toCached = function() {
    let cache: LazyValue<T> | null = null;
    return nu(function (callback: (value: T) => void) {
      if (cache === null) {
        cache = toLazy();
      }
      cache.get(callback);
    });
  };

  return {
    map: map,
    bind: bind,
    anonBind: anonBind,
    toLazy: toLazy,
    toCached: toCached,
    get: get
  };

};

/** a -> Future a */
const pure = function <T> (a: T) {
  return nu(function (callback: (value: T) => void) {
    callback(a);
  });
};

export const Future = {
  nu: nu,
  pure: pure
};