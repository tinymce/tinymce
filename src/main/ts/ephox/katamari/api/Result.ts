import * as Fun from './Fun';
import { Option } from './Option';

export interface Result<T, E> {
  is: (value: T) => boolean;
  or: (result: Result<T, E>) => Result<T, E>;
  orThunk: (makeResult: () => Result<T, E>) => Result<T, E>;
  map: <U> (mapper: (value: T) => U) => Result<U, E>;
  mapError: <U> (mapper: (err: E) => U) => Result<T, U>;
  each: (worker: (value: T) => void) => void;
  bind: <U> (binder: (value: T) => Result<U, E>) => Result<U, E>;
  fold: <U> (whenError: (err: E) => U, mapper: (value: T) => U) => U;
  exists: (predicate: (value: T) => boolean) => boolean;
  forall: (predicate: (value: T) => boolean) => boolean;
  toOption: () => Option<T>;
  isValue: () => boolean;
  isError: () => boolean;
  getOr: (defaultValue: T) => T;
  getOrThunk: (maker: () => T) => T;
  getOrDie: () => T;
};

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
 * toOption :: this Result a -> Option a
 * isValue :: this Result a -> Bool
 * isError :: this Result a -> Bool
 * getOr :: this Result a -> a -> a
 * getOrThunk :: this Result a -> (_ -> a) -> a
 * getOrDie :: this Result a -> a (or throws error)
*/

const value = function <T, E = any>(o: T): Result<T, E> {
  const is = function (v: T) {
    return o === v;
  };

  const or = function (opt: Result<T, E>) {
    return value(o);
  };

  const orThunk = function (f: () => Result<T, E>) {
    return value(o);
  };

  const map = function <U>(f: (value: T) => U) {
    return value(f(o));
  };

  const mapError = function <U>(f: (error: E) => U) {
    return value(o);
  };

  const each = function (f: (value: T) => void) {
    f(o);
  };

  const bind = function <U>(f: (value: T) => Result<U, E>) {
    return f(o);
  };

  const fold = function <U>(_: (err: E) => U, onValue: (value: T) => U) {
    return onValue(o);
  };

  const exists = function (f: (value: T) => boolean) {
    return f(o);
  };

  const forall = function (f: (value: T) => boolean) {
    return f(o);
  };

  const toOption = function () {
    return Option.some(o);
  };

  return {
    is: is,
    isValue: Fun.always,
    isError: Fun.never,
    getOr: Fun.constant(o),
    getOrThunk: Fun.constant(o),
    getOrDie: Fun.constant(o),
    or: or,
    orThunk: orThunk,
    fold: fold,
    map: map,
    mapError,
    each: each,
    bind: bind,
    exists: exists,
    forall: forall,
    toOption: toOption
  };
};

const error = function <T=any, E=any>(message: E): Result<T, E> {
  const getOrThunk = function (f: () => T) {
    return f();
  };

  const getOrDie = function (): T {
    return Fun.die(String(message))();
  };

  const or = function (opt: Result<T, E>) {
    return opt;
  };

  const orThunk = function (f: () => Result<T, E>) {
    return f();
  };

  const map = function <U>(f: (value: T) => U) {
    return error<U, E>(message);
  };

  const mapError = function <U>(f: (error: E) => U) {
    return error(f(message));
  };

  const bind = function <U>(f: (value: T) => Result<U, E>) {
    return error<U, E>(message);
  };

  const fold = function <U>(onError: (err: E) => U, _: (value: T) => U) {
    return onError(message);
  };

  return {
    is: Fun.never,
    isValue: Fun.never,
    isError: Fun.always,
    getOr: Fun.identity,
    getOrThunk: getOrThunk,
    getOrDie: getOrDie,
    or: or,
    orThunk: orThunk,
    fold: fold,
    map: map,
    mapError: mapError,
    each: Fun.noop,
    bind: bind,
    exists: Fun.never,
    forall: Fun.always,
    toOption: Option.none
  };
};

const fromOption = <T, E>(opt: Option<T>, err: E): Result<T, E> => {
  return opt.fold(
    () => error(err),
    value
  );
};

export const Result = {
  value,
  error,
  fromOption
};