import * as Fun from './Fun';
import { Optional } from './Optional';

export interface Result<T, E> {
  or: <T2 = T, E2 = E>(result: Result<T2, E2>) => Result<T | T2, E | E2>;
  orThunk: <T2 = T, E2 = E>(makeResult: () => Result<T2, E2>) => Result<T | T2, E | E2>;
  map: <U> (mapper: (value: T) => U) => Result<U, E>;
  mapError: <U> (mapper: (err: E) => U) => Result<T, U>;
  each: (worker: (value: T) => void) => void;
  bind: <U> (binder: (value: T) => Result<U, E>) => Result<U, E>;
  fold: <U> (whenError: (err: E) => U, mapper: (value: T) => U) => U;
  exists: (predicate: (value: T) => boolean) => boolean;
  forall: (predicate: (value: T) => boolean) => boolean;
  toOptional: () => Optional<T>;
  isValue: () => boolean;
  isError: () => boolean;
  getOr: <T2 = T>(defaultValue: T2) => T | T2;
  getOrThunk: <T2 = T>(maker: () => T2) => T | T2;
  getOrDie: () => T;
}

/* The type signatures for Result
 * is :: this Result a -> a -> Bool
 * or :: this Result a -> Result a -> Result a
 * orThunk :: this Result a -> (_ -> Result a) -> Result a
 * map :: this Result a -> (a -> b) -> Result b
 * each :: this Result a -> (a -> _) -> _
 * bind :: this Result a -> (a -> Result b) -> Result b
 * fold :: this Result a -> (_ -> b, a -> b) -> b
 * exists :: this Result a -> (a -> Bool) -> Bool
 * forall :: this Result a -> (a -> Bool) -> Bool
 * toOptional :: this Result a -> Optional a
 * isValue :: this Result a -> Bool
 * isError :: this Result a -> Bool
 * getOr :: this Result a -> a -> a
 * getOrThunk :: this Result a -> (_ -> a) -> a
 * getOrDie :: this Result a -> a (or throws error)
*/

const value = <T, E = never>(o: T): Result<T, E> => {
  const or = <T2 = T, E2 = E>(_opt: Result<T2, E2>) => {
    return value(o);
  };

  const orThunk = <T2 = T, E2 = E>(_f: () => Result<T2, E2>) => {
    return value(o);
  };

  const map = <U>(f: (value: T) => U) => {
    return value(f(o));
  };

  const mapError = <U>(_f: (error: E) => U) => {
    return value(o);
  };

  const each = (f: (value: T) => void) => {
    f(o);
  };

  const bind = <U>(f: (value: T) => Result<U, E>) => {
    return f(o);
  };

  const fold = <U>(_: (err: E) => U, onValue: (value: T) => U) => {
    return onValue(o);
  };

  const exists = (f: (value: T) => boolean) => {
    return f(o);
  };

  const forall = (f: (value: T) => boolean) => {
    return f(o);
  };

  const toOptional = () => {
    return Optional.some(o);
  };

  return {
    isValue: Fun.always,
    isError: Fun.never,
    getOr: Fun.constant(o),
    getOrThunk: Fun.constant(o),
    getOrDie: Fun.constant(o),
    or,
    orThunk,
    fold,
    map,
    mapError,
    each,
    bind,
    exists,
    forall,
    toOptional
  };
};

const error = <T = never, E = any>(message: E): Result<T, E> => {
  const getOrThunk = <T2 = T> (f: () => T2) => {
    return f();
  };

  const getOrDie = (): T => {
    return Fun.die(String(message))();
  };

  const or = Fun.identity;

  const orThunk = <T2 = T, E2 = E>(f: () => Result<T2, E2>) => {
    return f();
  };

  const map = <U>(_f: (value: T) => U) => {
    return error<U, E>(message);
  };

  const mapError = <U> (f: (error: E) => U) => {
    return error(f(message));
  };

  const bind = <U>(_f: (value: T) => Result<U, E>) => {
    return error<U, E>(message);
  };

  const fold = <U>(onError: (err: E) => U, _: (value: T) => U) => {
    return onError(message);
  };

  return {
    isValue: Fun.never,
    isError: Fun.always,
    getOr: Fun.identity,
    getOrThunk,
    getOrDie,
    or,
    orThunk,
    fold,
    map,
    mapError,
    each: Fun.noop,
    bind,
    exists: Fun.never,
    forall: Fun.always,
    toOptional: Optional.none
  };
};

const fromOption = <T, E>(opt: Optional<T>, err: E): Result<T, E> => opt.fold(
  () => error(err),
  value
);

export const Result = {
  value,
  error,
  fromOption
};
