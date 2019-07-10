import * as Arr from './Arr';
import { Option } from './Option';
import { setTimeout } from '@ephox/dom-globals';

export interface LazyValue<T> {
  get: (callback: (value: T) => void) => void;
  map: <U> (mapper: (value: T) => U) => LazyValue<U>;
  isReady: () => boolean;
}

const nu = function <T> (baseFn: (completer: (value: T) => void) => void): LazyValue<T> {
  let data = Option.none<T>();
  let callbacks: ((value: T) => void)[] = [];

  /** map :: this LazyValue a -> (a -> b) -> LazyValue b */
  const map = function <U> (f: (value: T) => U) {
    return nu(function (nCallback: (value: U) => void) {
      get(function (data) {
        nCallback(f(data));
      });
    });
  };

  const get = function (nCallback: (value: T) => void) {
    if (isReady()) {
      call(nCallback);
    } else {
      callbacks.push(nCallback);
    }
  };

  const set = function (x: T) {
    data = Option.some(x);
    run(callbacks);
    callbacks = [];
  };

  const isReady = function () {
    return data.isSome();
  };

  const run = function (cbs: ((value: T) => void)[]) {
    Arr.each(cbs, call);
  };

  const call = function (cb: (value: T) => void) {
    data.each(function (x) {
      setTimeout(function () {
        cb(x);
      }, 0);
    });
  };

  // Lazy values cache the value and kick off immediately
  baseFn(set);

  return {
    get,
    map,
    isReady
  };
};

const pure = function <T> (a: T) {
  return nu(function (callback: (value: T) => void) {
    callback(a);
  });
};

export const LazyValue = {
  nu,
  pure
};
