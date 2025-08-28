import { Future } from './Future';
import { Result } from './Result';

export interface FutureResult<A, E> extends Future<Result<A, E>> {
  readonly toCached: () => FutureResult<A, E>;
  readonly bindFuture: <B>(f: (value: A) => Future<Result<B, E>>) => FutureResult<B, E>;
  readonly bindResult: <B>(f: (value: A) => Result<B, E>) => FutureResult<B, E>;
  readonly mapResult: <B>(f: (value: A) => B) => FutureResult<B, E>;
  readonly mapError: <B>(f: (error: E) => B) => FutureResult<A, B>;
  readonly foldResult: <X>(whenError: (error: E) => X, whenValue: (value: A) => X) => Future<X>;
  readonly withTimeout: (timeout: number, errorThunk: () => E) => FutureResult<A, E>;
}

const wrap = <A = any, E = any> (delegate: Future<Result<A, E>>): FutureResult<A, E> => {

  const toCached = () => {
    return wrap(delegate.toCached());
  };

  const bindFuture = <B>(f: (value: A) => Future<Result<B, E>>) => {
    return wrap(
      delegate.bind(
        (resA) => resA.fold(
          (err: E) => (Future.pure(Result.error(err))),
          (a: A) => f(a)
        )
      )
    );
  };

  const bindResult = <B>(f: (value: A) => Result<B, E>) => {
    return wrap(delegate.map((resA) => resA.bind(f)));
  };

  const mapResult = <B>(f: (value: A) => B) => {
    return wrap(delegate.map((resA) => resA.map(f)));
  };

  const mapError = <B>(f: (error: E) => B) => {
    return wrap(delegate.map((resA) => resA.mapError(f)));
  };

  const foldResult = <X>(whenError: (error: E) => X, whenValue: (value: A) => X) => {
    return delegate.map((res) => res.fold(whenError, whenValue));
  };

  const withTimeout = (timeout: number, errorThunk: () => E) => {
    return wrap(Future.nu((callback: (value: Result<A, E>) => void) => {
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        callback(Result.error(errorThunk()));
      }, timeout);

      delegate.get((result) => {
        if (!timedOut) {
          clearTimeout(timer);
          callback(result);
        }
      });
    }));
  };

  return {
    ...delegate,
    toCached,
    bindFuture,
    bindResult,
    mapResult,
    mapError,
    foldResult,
    withTimeout
  };
};

const nu = <A = any, E = any>(worker: (completer: (result: Result<A, E>) => void) => void): FutureResult<A, E> => {
  return wrap(Future.nu(worker));
};

const value = <A, E = any>(value: A): FutureResult<A, E> => {
  return wrap(Future.pure(Result.value(value)));
};

const error = <A = any, E = any>(error: E): FutureResult<A, E> => {
  return wrap(Future.pure(Result.error(error)));
};

const fromResult = <A, E>(result: Result<A, E>): FutureResult<A, E> => {
  return wrap(Future.pure(result));
};

const fromFuture = <A>(future: Future<A>): FutureResult<A, never> => {
  return wrap(future.map(Result.value));
};

const fromPromise = <T, E = any>(promise: Promise<T>): FutureResult<T, E> => {
  return nu((completer: (result: Result<T, E>) => void) => {
    promise.then((value) => {
      completer(Result.value(value));
    }, (error: E) => {
      completer(Result.error(error));
    });
  });
};

export const FutureResult = {
  nu,
  wrap,
  pure: value,
  value,
  error,
  fromResult,
  fromFuture,
  fromPromise
};
