import * as Arr from './Arr';
import { Optional } from './Optional';

export interface LazyValue<T> {
  readonly get: (callback: (value: T) => void) => void;
  readonly map: <U> (mapper: (value: T) => U) => LazyValue<U>;
  readonly isReady: () => boolean;
}

const nu = <T>(baseFn: (completer: (value: T) => void) => void): LazyValue<T> => {
  let data = Optional.none<T>();
  let callbacks: ((value: T) => void)[] = [];

  /** map :: this LazyValue a -> (a -> b) -> LazyValue b */
  const map = <U>(f: (value: T) => U) => nu((nCallback: (value: U) => void) => {
    get((data) => {
      nCallback(f(data));
    });
  });

  const get = (nCallback: (value: T) => void) => {
    if (isReady()) {
      call(nCallback);
    } else {
      callbacks.push(nCallback);
    }
  };

  const set = (x: T) => {
    if (!isReady()) {
      data = Optional.some(x);
      run(callbacks);
      callbacks = [];
    }
  };

  const isReady = () => data.isSome();

  const run = (cbs: ((value: T) => void)[]) => {
    Arr.each(cbs, call);
  };

  const call = (cb: (value: T) => void) => {
    data.each((x) => {
      setTimeout(() => {
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

const pure = <T>(a: T): LazyValue<T> =>
  nu((callback: (value: T) => void) => {
    callback(a);
  });

export const LazyValue = {
  nu,
  pure
};
