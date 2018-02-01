import LazyValue, { LazyValueType } from './LazyValue';
import Bounce from '../async/Bounce';

export interface FutureType<T> {
  map: <U> (mapper: (v: T) => U) => FutureType<U>;
  bind: <U> (binder: (v: T) => FutureType<U>) => FutureType<U>;
  anonBind: <U> (thunk: FutureType<U>) => FutureType<U>;
  toLazy: () => LazyValueType<T>;
  get: (callback: (v: T) => void) => void;
};

var nu = function <T = any> (baseFn: (completer: (value?: T) => void) => void) : FutureType<T> {
  var get = function(callback: (value: T) => void) {
    baseFn(Bounce.bounce(callback));
  };

  /** map :: this Future a -> (a -> b) -> Future b */
  var map = function <U> (fab: (v: T) => U) {
    return nu(function (callback: (value: U) => void) {
      get(function (a) {
        var value = fab(a);
        callback(value);
      });
    });
  };

  /** bind :: this Future a -> (a -> Future b) -> Future b */
  var bind = function <U> (aFutureB: (v: T) => FutureType<U>) {
    return nu(function (callback: (value: U) => void) {
      get(function (a) {
        aFutureB(a).get(callback);
      });
    });
  };

  /** anonBind :: this Future a -> Future b -> Future b
   *  Returns a future, which evaluates the first future, ignores the result, then evaluates the second.
   */
  var anonBind = function <U> (futureB: FutureType<U>) {
    return nu(function (callback: (value: U) => void) {
      get(function (a) {
        futureB.get(callback);
      });
    });
  };

  var toLazy = function () {
    return LazyValue.nu(get);
  };

  return {
    map: map,
    bind: bind,
    anonBind: anonBind,
    toLazy: toLazy,
    get: get
  };

};

/** a -> Future a */
var pure = function <T> (a: T) {
  return nu(function (callback: (value: T) => void) {
    callback(a);
  });
};

export default {
  nu: nu,
  pure: pure
};