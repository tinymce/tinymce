import * as Fun from './Fun';
import { Optional } from './Optional';

/**
 * The Result type represents the result of a computation that may have failed.
 * Any Result<T, E> can either be a Value<T> (in which case the computation
 * succeeded), or an Error<E> (in which case the computation failed, and the
 * error that caused the computation to fail is of type E). This file defines a
 * lot of FP-inspired utility functions for dealing with Result objects. Note:
 * Functions are grouped on, primarily, their Haskell roots. That said, I'm not
 * a Haskell programmer so it might be imperfect.
 *
 * Comparison with exceptions:
 * - Result isn't supported by first-class language features (no try/catch
 *   syntax)
 * - You can never forget to wrap a Result in a try/catch, as you need to call
 * one of these helper functions to get the value inside
 * - Result will track the type of your error (typescript forces you to use
 *   either any or unknown in catch blocks)
 * - Try to use Result instead of exceptions where you can
 *
 * Comparison with Optional<T>:
 * - The only difference is that in the "doesn't have a value" case, a Result
 *   has an error and an Optional has nothing
 * - If it's important for the person holding the object to know what went
 *   wrong, or handle an error, use Result
 * - If there's absolutely nothing that can be done with the error any more,
 *   use Optional
 * - If the word "error" doesn't describe what happens when the value isn't
 *   present (ie. nothing went wrong, it just simply isn't there) use Optional
 */
export interface Result<T, E> {
  // --- Identities ---

  /**
   * Perform a transform on the Result type. Similar to the fold method on a
   * number of ADTs in the TinyMCE codebase, you pass two functions into this -
   * if `this` **does not** contain a value (and therefore contains an error)
   * then `onError` will be called (with the error as its argument) but if
   * `this` **does** contain a value then `onValue` will be called (with the
   * value as its argument).
   */
  fold: <U> (onError: (err: E) => U, onValue: (value: T) => U) => U;

  /**
   * Determines if this Result object contains a value.
   */
  isValue: () => boolean;

  /**
   * Determines if this Result object contains an error (and therefore does not
   * contain an error).
   */
  isError: () => boolean;

  // --- Functor ---

  /**
   * Perform a transform on this Result object, **if** there is a value. If you
   * provide a function to turn a `T` into a `U`, this is the function you use
   * to turn a `Result<T, E>` into a `Result<U, E>`. If this **does** contain a
   * value then the output will also contain a value (that value being the
   * output of `mapper(this.value)`, and if this **does not** contain a value
   * then neither will the output (and the output will keep the same error as
   * this).
   */
  map: <U> (mapper: (value: T) => U) => Result<U, E>;

  /**
   * Perform a transform on this Result object, if there **is not** a value. If
   * you provide a function to turn an `E` into `F`, this is the function you
   * use to turn a `Result<T, E>` into a `Result<T, F>`. If this **does not**
   * contain a value then the output will also not contain a value (and its
   * error will be the output of `mapper(this.error)`), and if this **does**
   * contain a value then so will the output (and the output will keep the same
   * value as this).
   */
  mapError: <U> (mapper: (err: E) => U) => Result<T, U>;

  // --- Monad ---

  /**
   * Perform a transform on the Result object, **if** there is a value. Unlike
   * the map function earlier in the piece, here the transformation also can
   * fail (and therefore returns a Result).
   */
  bind: <U> (binder: (value: T) => Result<U, E>) => Result<U, E>;

  // --- Traversable ---

  /**
   * For a given predicate, this function finds out if there **exists** a value
   * inside this Result object that meets the predicate. In practice, this
   * means that for error containing objects it returns false (as no predicate
   * meeting value exists).
   */
  exists: (predicate: (value: T) => boolean) => boolean;

  /**
   * For a given predicate, this function finds out if **all** the values inside
   * this Result object meet the predicate. In practice, this means that for
   * error containing objects it returns true (as all 0 values do meet the
   * predicate).
   */
  forall: (predicate: (value: T) => boolean) => boolean;

  // --- Getters ---

  /**
   * Get the value out of this Result object, using a default replacement value
   * if the provided Result object contains an error instead.
   */
  getOr: <T2 = T>(defaultValue: T2) => T | T2;

  /**
   * Get the value out of this Result object, using a default replacement value
   * if this Result contains an error instead. Unlike `getOr`, in this method
   * the replacement is also a Result - meaning that this method will always
   * return a Result.
   */
  or: <T2 = T, E2 = E>(result: Result<T2, E2>) => Result<T | T2, E | E2>;

  /**
   * Get the value out of this Result object, using a default replacement value
   * if this Result contains an error instead. Unlike `getOr`, in this method
   * the default value is "thunked" - that is to say that you don't pass a
   * value to `getOrThunk`, you pass a function which (if called) will
   * **return** the value you want to use.
   */
  getOrThunk: <T2 = T>(getDefaultValue: () => T2) => T | T2;

  /**
   * Get the value out of this Result object, using a default replacement value
   * if this Result contains an error instead.
   *
   * Unlike `or`, the default value is "thunked" - that is to say you don't
   * pass a value to `orThunk`, you pass a function which (if called) will
   * **return** the value you want to use.
   *
   * Unlike `getOrThunk`, in this method the default is also a Result - meaning
   * that this method will always return a Result.
   */
  orThunk: <T2 = T, E2 = E>(makeResult: () => Result<T2, E2>) => Result<T | T2, E | E2>;

  /**
   * Get the value out of the inside of the Result object, throwing an
   * exception if the provided Result object does not contain a value.
   *
   * WARNING:
   * You should only be using this function if you know that the Result
   * object **does not** contain an error (otherwise you're throwing exceptions
   * in production code, which is bad).
   *
   * In tests this is more acceptable.
   *
   * Prefer other methods to this, such as `.each`.
   */
  getOrDie: () => T;

  // --- Utilities ---

  /**
   * If the Result contains a value, perform an action on that value. Unlike
   * the rest of the methods on this type, `.each` has side-effects. If you want
   * to transform a Result<T, E> **into** something, then this is not the method
   * for you. If you want to use a Result<T, E> to **do** something, then this
   * is the method for you - provided you're okay with not doing anything in the
   * case where the Result has an error inside it. If you're not sure whether
   * your use-case fits into transforming **into** something or **doing**
   * something, check whether it has a return value. If it does, you're looking
   * at a transform.
   */
  each: (worker: (value: T) => void) => void;

  /**
   * Turn this Result into an Optional. If this Result has a value in it, so
   * will the returned Optional. If this Result has an error in it, the error
   * will be discarded and `Optional.none()` will be returned.
   */
  toOptional: () => Optional<T>;
}

/**
 * Creates a new Result<T, E> that **does** contain a value. The error type
 * doesn't matter here, as there is no error in this object, so we default it
 * to `never` to make casting easier.
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

/**
 * Creates a new Result that **does not** contain a value, and therefore
 * contains an error. The value type doesn't matter here, as there is no value
 * in this object, so we default it to `never` to make casting easier.
 */
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

/**
 * Convert an Optional into a Result. If the Optional has a value in it, so
 * will the returned Result. If the Optional does not have a value in it, the
 * returned Result will have an error in it (and the error will be the argument
 * `err`).
 */
const fromOption = <T, E>(opt: Optional<T>, err: E): Result<T, E> => opt.fold(
  () => error(err),
  value
);

export const Result = {
  value,
  error,
  fromOption
};
