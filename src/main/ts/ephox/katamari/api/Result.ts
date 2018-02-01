import Fun from './Fun';
import Option, { OptionType } from './Option';

export interface ResultType<T, E> {
  is: (value: T) => boolean;
  or: (result: ResultType<T, E>) => ResultType<T, E>;
  orThunk: (makeResult: () => ResultType<T, E>) => ResultType<T, E>;
  map: <U> (mapper: (value: T) => U) => ResultType<U, E>;
  each: (worker: (value: T) => void) => void;
  bind: <U> (binder: (value: T) => ResultType<U, E>) => ResultType<U, E>;
  fold: <U> (whenError: (err: E) => U, mapper: (value: T) => U) => U;
  exists: (predicate: (value: T) => boolean) => boolean;
  forall: (predicate: (value: T) => boolean) => boolean;
  toOption: () => OptionType<T>;
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

var value = function <T, E = any>(o: T): ResultType<T, E> {
  var is = function (v: T) {
    return o === v;
  };

  var or = function (opt: ResultType<T, E>) {
    return value(o);
  };

  var orThunk = function (f: () => ResultType<T, E>) {
    return value(o);
  };

  var map = function <U>(f: (value: T) => U) {
    return value(f(o));
  };

  var each = function (f: (value: T) => void) {
    f(o);
  };

  var bind = function <U>(f: (value: T) => ResultType<U, E>) {
    return f(o);
  };

  var fold = function <U>(_: (err: E) => U, onValue: (value: T) => U) {
    return onValue(o);
  };

  var exists = function (f: (value: T) => boolean) {
    return f(o);
  };

  var forall = function (f: (value: T) => boolean) {
    return f(o);
  };

  var toOption = function () {
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
    each: each,
    bind: bind,
    exists: exists,
    forall: forall,
    toOption: toOption
  };
};

var error = function <T=any, E=any>(message: E): ResultType<T, E> {
  var getOrThunk = function (f: () => T) {
    return f();
  };

  var getOrDie = function (): T {
    return Fun.die(message)();
  };

  var or = function (opt: ResultType<T, E>) {
    return opt;
  };

  var orThunk = function (f: () => ResultType<T, E>) {
    return f();
  };

  var map = function <U>(f: (value: T) => U) {
    return error<U, E>(message);
  };

  var bind = function <U>(f: (value: T) => ResultType<U, E>) {
    return error<U, E>(message);
  };

  var fold = function <U>(onError: (err: E) => U, _: (value: T) => U) {
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
    each: Fun.noop,
    bind: bind,
    exists: Fun.never,
    forall: Fun.always,
    toOption: Option.none
  };
};

export default {
  value: value,
  error: error
};