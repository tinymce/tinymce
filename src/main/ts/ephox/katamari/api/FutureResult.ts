import { Future } from './Future';
import { Result } from './Result';

export interface FutureResult<A, E> extends Future<Result<A, E>> {
  bindFuture: <B>(f: (value: A) => Future<Result<B, E>>) => FutureResult<B, E>;
  bindResult: <B>(f: (value: A) => Result<B, E>) => FutureResult<B, E>;
  mapResult: <B>(f: (value: A) => B) => FutureResult<B, E>;
  foldResult: <X>(whenError: (error: E) => X, whenValue: (value: A) => X) => Future<X>;
  withTimeout: <E2>(timeout: number, errorThunk: () => E2) => FutureResult<A, E | E2>
}

var wrap = function <A=any, E=any>(delegate: Future<Result<A, E>>): FutureResult<A, E> {

  var bindFuture = function <B>(f: (value: A) => Future<Result<B, E>>) {
    return wrap(
      delegate.bind(
        (resA) => resA.fold(
          () => <Future<Result<B, E>>>(<any>delegate),
          (a: A) => f(a)
        )
      )
    );
  };

  var bindResult = function <B>(f: (value: A) => Result<B, E>) {
    return wrap(delegate.map((resA) => resA.bind(f)));
  };

  var mapResult = function <B>(f: (value: A) => B) {
    return wrap(delegate.map((resA) => resA.map(f)));
  };

  var foldResult = function <X>(whenError: (error: E) => X, whenValue: (value: A) => X) {
    return delegate.map((res) => res.fold(whenError, whenValue));
  };

  var withTimeout = function <E2>(timeout: number, errorThunk: () => E2) {
    return wrap(Future.nu(function (callback: (value: Result<A, E | E2>) => void) {
      var timedOut = false;
      var timer = window.setTimeout(() => {
        timedOut = true;
        callback(Result.error(errorThunk()));
      }, timeout);

      delegate.get((result) => {
        if (!timedOut) {
          window.clearTimeout(timer);
          callback(result);
        }
      });
    }));
  };

  return {
    ...delegate,
    bindFuture,
    bindResult,
    mapResult,
    foldResult,
    withTimeout
  };
};

var nu = function <A=any, E=any>(worker: (completer: (result: Result<A, E>) => void) => void) {
  return wrap(Future.nu(worker));
}

var value = function <A, E=any>(value: A) {
  return wrap(Future.pure(Result.value(value)));
};

var error = function <A=any, E=any>(error: E) {
  return wrap(Future.pure(Result.error(error)));
};

var fromResult = function <A, E>(result: Result<A, E>) {
  return wrap(Future.pure(result));
};

var fromFuture = function <A, E=any>(future: Future<A>) {
  return wrap(future.map(Result.value));
};

var fromPromise = function <T, E=any>(promise: Promise<T>) {
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