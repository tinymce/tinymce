import * as Fun from './Fun';
import { Optional } from './Optional';

/**
 * The `Result` type represents a value (of any type) that may instead be an
 * error (of any type). Any `Result<T, E>` can either be a `Value<T>` (which
 * contains a value of type `T`) or an `Error<E>` (which contains an error of
 * type `E`). This module defines a whole lot of FP-inspired utility functions
 * for dealing with `Result` objects.
 *
 * Comparison with exceptions:
 * - Each function's type signature says whether it returns a `Result` or not
 * (they're like checked exceptions).
 * - The type of the error in a result can be checked by TypeScript.
 * - You can't forget to catch errors from inside a `Result`, you need to handle
 * them to access the value.
 *
 * Comparison with optionals:
 * - Both `Optional` and `Result` are a typesafe way to store data that might
 * not exist.
 * - Similar functions are defined on both `Optional` and `Result` to operate on
 * the data inside.
 * - The difference is in what happens when the data **does not** exist:
 *   - `Optional` stores nothing if the data is not there.
 *   - `Result` stores an error if the data is not there.
 * - Decide whether to use `Optional` or `Result` based on what no data means
 * for your use-case:
 *   - Use `Optional` if no data just means there isn't any data, and isn't an
 *   issue.
 *   - Use `Result` if no data means an error occurred, and you might need to
 *   operate on the error later.
 */
export interface Result<T, E> {
  // --- Identities ---

  /**
   * Perform a transform on a `Result` type. Regardless of whether this `Result`
   * contains an error or a value, `fold` will return a value of type `U`. If
   * this `Result` contains an error, the `U` will be created by calling
   * `onError`. If this `Result` contains a value, the `U` will be created by
   * calling `onValue`.
   *
   * For the FP enthusiasts in the room, this function:
   * 1. Could be used to implement all of the functions below
   * 2. Forms a catamorphism
   */
  readonly fold: <U>(onError: (error: E) => U, onValue: (value: T) => U) => U;

  /**
   * Determines if this `Result` object contains a value.
   */
  readonly isValue: () => boolean;

  /**
   * Determines if this `Result` object **does not** contain a value (and
   * therefore contains an error instead).
   */
  readonly isError: () => boolean;

  // --- Functor (name stolen from Haskell / maths) ---

  /**
   * Perform a transform on a `Result` object, **if** there is a value. If you
   * provide a function to turn a `T` into a `U`, this is the function you use
   * to turn a `Result<T, E>` into a `Result<U, E>`. If this `Result` **does**
   * contain a value then the output will also contain a value (that value being
   * the output of `mapper(this.value)`), and if this **does not** contain a
   * value then neither will the output (and the error will remain the same).
   */
  readonly map: <U>(mapper: (value: T) => U) => Result<U, E>;

  /**
   * Perform a transform on a `Result` object, if there **is not** a value. If
   * you provide a function to turn an `E` into an `F`, this is the function you
   * use to turn a `Result<T, E>` into a `Result<T, F>`. If this `Result` **does
   * not** contain a value, and therefore contains an error, then the output
   * will not contain a value either (and the error will be the output of
   * `mapper(this.error)`). If this **does** contain a value then so will the
   * output (and the value will be the same value).
   */
  readonly mapError: <F>(mapper: (error: E) => F) => Result<T, F>;

  // --- Monad (name stolen from Haskell / maths) ---

  /**
   * Perform a transform on a `Result` object, **if** there is a value. If you
   * have a function that attempts to transform a `T` into a `U` (i.e. a
   * function that turns `T` into `Result<U, E>`) then this function will
   * transform a `Result<T, E>` into a `Result<U, E>`. If this `Result` **does**
   * contain a value, then the output will be `binder(this.value)`, and if this
   * **does not** contain a value then neither will the output (and the error
   * will remain the same).
   */
  readonly bind: <U>(binder: (value: T) => Result<U, E>) => Result<U, E>;

  // --- Traversable (name stolen from Haskell / maths) ---

  /**
   * For a given predicate, this function finds out if there **exists** a value
   * inside this `Result` object that meets the predicate. In practice, this
   * means that for `Results` that contain errors it returns false (as no
   * predicate-meeting value exists).
   */
  readonly exists: (predicate: (value: T) => boolean) => boolean;

  /**
   * For a given predicate, this function finds out if *all** the values inside
   * this `Result` meet the predicate. In practice, this means that for
   * `Results` that contain errors it returns true (as all 0 values do meet the
   * predicate).
   */
  readonly forall: (predicate: (value: T) => boolean) => boolean;

  // --- Getters --

  /**
   * Get the value out of the inside of the `Result` object, using a default
   * `replacement` value if the provided `Result` object does not contain a value.
   */
  readonly getOr: <T2 = T>(replacement: T2) => T | T2;

  /**
   * Get the value out of the inside of the `Result` object, using a default
   * `replacement` value if the provided `Result` object does not contain a
   * value. Unlike `getOr`, in this method the `replacement` value is also a
   * `Result` - meaning that this method will always return a `Result`.
   */
  readonly or: <T2 = T, E2 = E>(replacement: Result<T2, E2>) => Result<T | T2, E | E2>;

  /**
   * Get the value out of the inside of this `Result` object, using a default
   * `replacement` value if the provided `Result` does not contain a value.
   *
   * Unlike `getOr`, in this method the replacement value is "thunked" - that is
   * to say that you don't pass a value to `getOrThunk`, you pass a function
   * which (if called) will **return** the value you want to use.
   */
  readonly getOrThunk: <T2 = T>(thunk: () => T2) => T | T2;

  /**
   * Get the value out of the inside of this `Result` object, using a default
   * `replacement` value if the provided `Result` does not contain a value.
   *
   * Unlike `or`, in this method the replacement value is "thunked" - that is to
   * say that you don't pass a value to `orThunk`, you pass a function which (if
   * called) will **return** the value you want to use.
   *
   * Unlike `getOrThunk`, in this method the replacement value is also a
   * `Result`, meaning that this method will always return a `Result`.
   */
  readonly orThunk: <T2 = T, E2 = E>(thunk: () => Result<T2, E2>) => Result<T | T2, E | E2>;

  /**
   * Get the value out of the inside of the `Result` object, throwing an
   * exception if the provided `Result` object contains an error instead of a
   * value.
   *
   * WARNING: You should only be using this function if you know that the
   * `Result` object **does** contain a value (otherwise you're throwing
   * exceptions in production code, which is bad).
   *
   * In tests this is more acceptable.
   *
   * Prefer other methods to this, such as `.each`.
   */
  readonly getOrDie: () => T;

  // --- Utilities ---

  /**
   * If this `Result` contains a value, perform an action on that value. Unlike
   * the rest of the methods on this type, `.each` has side-effects. If you want
   * to transform a `Result<T, E>` **into** something, then this is not the
   * method for you. If you want to use a `Result<T, E>` to **do** something,
   * then this is the method for you - provided you're okay with not doing
   * anything in the case where the `Result` doesn't have a value inside it. If
   * you're not sure whether your use-case fits into transforming **into**
   * something or **doing** something, check whether it has a return value. If
   * it does, you should be performing a transform.
   */
  readonly each: (worker: (value: T) => void) => void;

  /**
   * Convert this `Result<T, E>` to an `Optional<T>`. If this object contains a
   * value, so will the output. If this object contains an error, the error will
   * be discarded and the output will not contain a value.
   */
  readonly toOptional: () => Optional<T>;
}

/* Debugging information. This is deliberately not included in the exported
 * types, because we don't want production code to use it, but it's very useful
 * to have this information included in the objects themselves for when you're
 * looking at them in the console or debugger.
 */
interface DebugResult<T, E> extends Result<T, E> {
  /**
   * True for `Value`, False for `Error`.
   */
  readonly tag: boolean;

  /**
   * The value or error contained within this Result object.
   */
  readonly inner: T | E;
}

/**
 * Creates a new `Result<T, E>` that **does** contain a value.
 */
const value = <T, E = never>(value: T): Result<T, E> => {

  const applyHelper = <U>(fn: (value: T) => U): U => fn(value);
  const constHelper = Fun.constant(value);
  const outputHelper = <E2 = E>() => output as unknown as Result<T, E2>;

  const output: DebugResult<T, E> = {
    // Debug info
    tag: true,
    inner: value,
    // Actual Result methods
    fold: (_onError, onValue) => onValue(value),
    isValue: Fun.always,
    isError: Fun.never,
    map: (mapper) => Result.value(mapper(value)),
    mapError: outputHelper,
    bind: applyHelper,
    exists: applyHelper,
    forall: applyHelper,
    getOr: constHelper,
    or: outputHelper,
    getOrThunk: constHelper,
    orThunk: outputHelper,
    getOrDie: constHelper,
    each: (fn) => {
      // Can't write the function inline because we don't want to return something by mistake
      fn(value);
    },
    toOptional: () => Optional.some(value),
  };

  return output;
};

/**
 * Creates a new `Result<T, E>` that **does not** contain a value, and therefore
 * contains an error.
 */
const error = <T = never, E = any>(error: E): Result<T, E> => {
  const outputHelper = <U = T>() => output as unknown as Result<U, E>;

  const output: DebugResult<T, E> = {
    // Debug info
    tag: false,
    inner: error,
    // Actual Result methods
    fold: (onError, _onValue) => onError(error),
    isValue: Fun.never,
    isError: Fun.always,
    map: outputHelper,
    mapError: (mapper) => Result.error(mapper(error)),
    bind: outputHelper,
    exists: Fun.never,
    forall: Fun.always,
    getOr: Fun.identity,
    or: Fun.identity,
    getOrThunk: Fun.apply,
    orThunk: Fun.apply,
    getOrDie: Fun.die(String(error)),
    each: Fun.noop,
    toOptional: Optional.none,
  };

  return output;
};

/**
 * Creates a new `Result<T, E>` from an `Optional<T>` and an `E`. If the
 * `Optional` contains a value, so will the outputted `Result`. If it does not,
 * the outputted `Result` will contain an error (and that error will be the
 * error passed in).
 */
const fromOption = <T, E>(optional: Optional<T>, err: E): Result<T, E> =>
  optional.fold(() => error(err), value);

export const Result = {
  value,
  error,
  fromOption
};
