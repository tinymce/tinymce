import { Future } from './Future';
import { Result } from './Result';
import { clearTimeout, setTimeout } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';

export interface FutureResult<A, E> extends Future<Result<A, E>> {
  toCached: () => FutureResult<A, E>;
  bindFuture: <B>(f: (value: A) => Future<Result<B, E>>) => FutureResult<B, E>;
  bindResult: <B>(f: (value: A) => Result<B, E>) => FutureResult<B, E>;
  mapResult: <B>(f: (value: A) => B) => FutureResult<B, E>;
  mapError: <B>(f: (error: E) => B) => FutureResult<A, B>;
  foldResult: <X>(whenError: (error: E) => X, whenValue: (value: A) => X) => Future<X>;
  withTimeout: (timeout: number, errorThunk: () => E) => FutureResult<A, E>;
}

const wrap = function <A = any, E = any>(delegate: Future<Result<A, E>>): FutureResult<A, E> {

  const toCached = function () {
    return wrap(delegate.toCached());
  };

  const bindFuture = function <B>(f: (value: A) => Future<Result<B, E>>) {
    return wrap(
      delegate.bind(
        (resA) => resA.fold(
          (err: E) => <Future<Result<B, E>>> (Future.pure(Result.error(err))),
          (a: A) => f(a)
        )
      )
    );
  };

  const bindResult = function <B>(f: (value: A) => Result<B, E>) {
    return wrap(delegate.map((resA) => resA.bind(f)));
  };

  const mapResult = function <B>(f: (value: A) => B) {
    return wrap(delegate.map((resA) => resA.map(f)));
  };

  const mapError = function <B>(f: (error: E) => B) {
    return wrap(delegate.map((resA) => resA.mapError(f)));
  };

  const foldResult = function <X>(whenError: (error: E) => X, whenValue: (value: A) => X) {
    return delegate.map((res) => res.fold(whenError, whenValue));
  };

  const withTimeout = function (timeout: number, errorThunk: () => E) {
    return wrap(Future.nu(function (callback: (value: Result<A, E>) => void) {
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

const nu = function <A = any, E = any>(worker: (completer: (result: Result<A, E>) => void) => void) {
  return wrap(Future.nu(worker));
};

const value = function <A, E = any>(value: A) {
  return wrap(Future.pure(Result.value(value)));
};

const error = function <A = any, E = any>(error: E) {
  return wrap(Future.pure(Result.error(error)));
};

const fromResult = function <A, E>(result: Result<A, E>) {
  return wrap(Future.pure(result));
};

const fromFuture = function <A, E = any>(future: Future<A>) {
  return wrap(future.map(Result.value));
};

const fromPromise = function <T, E = any>(promise: Promise<T>) {
  return nu(function (completer: (result: Result<T, E>) => void) {
    promise.then(function (value) {
      completer(Result.value(value));
    }, function (error: E) {
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
