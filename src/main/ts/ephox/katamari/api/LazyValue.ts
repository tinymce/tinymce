import Arr from './Arr';
import { Option } from './Option';

export interface LazyValue<T> {
  get: (callback: (value: T) => void) => void;
  map: <U> (mapper: (value: T) => U) => LazyValue<U>;
  isReady: () => boolean;
}

var nu = function <T> (baseFn: (completer: (value: T) => void) => void): LazyValue<T> {
  var data = Option.none<T>();
  var callbacks: ((value: T) => void)[] = [];

  /** map :: this LazyValue a -> (a -> b) -> LazyValue b */
  var map = function <U> (f: (value: T) => U) {
    return nu(function (nCallback: (value: U) => void) {
      get(function (data) {
        nCallback(f(data));
      });
    });
  };

  var get = function (nCallback: (value: T) => void) {
    if (isReady()) call(nCallback);
    else callbacks.push(nCallback);
  };

  var set = function (x: T) {
    data = Option.some(x);
    run(callbacks);
    callbacks = [];
  };

  var isReady = function () {
    return data.isSome();
  };

  var run = function (cbs: ((value: T) => void)[]) {
    Arr.each(cbs, call);
  };

  var call = function(cb: (value: T) => void) {
    data.each(function(x) {
      setTimeout(function() {
        cb(x);
      }, 0);
    });
  };

  // Lazy values cache the value and kick off immediately
  baseFn(set);

  return {
    get: get,
    map: map,
    isReady: isReady
  };
};

var pure = function <T> (a: T) {
  return nu(function (callback: (value: T) => void) {
    callback(a);
  });
};

export const LazyValue = {
  nu: nu,
  pure: pure
};