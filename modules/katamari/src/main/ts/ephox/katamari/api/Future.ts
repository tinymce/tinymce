import { LazyValue } from './LazyValue';

export interface Future<T> {
  readonly map: <U> (mapper: (v: T) => U) => Future<U>;
  readonly bind: <U> (binder: (v: T) => Future<U>) => Future<U>;
  readonly anonBind: <U> (thunk: Future<U>) => Future<U>;
  readonly toLazy: () => LazyValue<T>;
  readonly toCached: () => Future<T>;
  readonly toPromise: () => Promise<T>;
  readonly get: (callback: (v: T) => void) => void;
}

const errorReporter = (err: any) => {
  // we can not throw the error in the reporter as it will just be black-holed
  // by the Promise so we use a setTimeout to escape the Promise.
  setTimeout(() => {
    throw err;
  }, 0);
};

const make = <T = any>(run: () => Promise<T>): Future<T> => {

  const get = (callback: (value: T) => void) => {
    run().then(callback, errorReporter);
  };

  /** map :: this Future a -> (a -> b) -> Future b */
  const map = <U>(fab: (v: T) => U) => {
    return make(() => run().then(fab));
  };

  /** bind :: this Future a -> (a -> Future b) -> Future b */
  const bind = <U>(aFutureB: (v: T) => Future<U>) => {
    return make(() => run().then((v) => aFutureB(v).toPromise()));
  };

  /** anonBind :: this Future a -> Future b -> Future b
   *  Returns a future, which evaluates the first future, ignores the result, then evaluates the second.
   */
  const anonBind = <U>(futureB: Future<U>) => {
    return make(() => run().then(() => futureB.toPromise()));
  };

  const toLazy = () => {
    return LazyValue.nu(get);
  };

  const toCached = () => {
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

const nu: {
  <T = any>(baseFn: (completer: (value: T) => void) => void): Future<T>;
  (baseFn: (completer: () => void) => void): Future<void>;
} = <T = any>(baseFn: (completer: (value?: T) => void) => void): Future<T | void> => {
  return make(() => new Promise(baseFn));
};

/** a -> Future a */
const pure = <T>(a: T): Future<T> => {
  return make(() => Promise.resolve(a));
};

export const Future = {
  nu,
  pure
};
