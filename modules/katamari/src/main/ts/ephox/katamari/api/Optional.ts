import * as Fun from './Fun';

/** A value which may be Optional.some(a) or Optional.none().
 *  Useful for representing partiality or pass/fail conditions that produce a value when successful.
 *  Sometimes called a "type-safe alternative to null".
 *  Can be thought of as a list of exactly zero or 1 elements.
 */
export interface Optional<T> {
  /** If none, run whenNone; if some(a) run whenSome(a) */
  readonly fold: <U> (whenNone: () => U, whenSome: (v: T) => U) => U;

  readonly isSome: () => boolean;
  readonly isNone: () => boolean;

  /** If some(x) return x, otherwise return the specified default value */
  readonly getOr: <T2 = T>(value: T2) => T | T2;

  /** getOr with a thunked default value */
  readonly getOrThunk: <T2 = T>(makeValue: () => T2) => T | T2;

  /** get the 'some' value; throw if none */
  readonly getOrDie: (msg?: string) => T;

  readonly getOrNull: () => T | null;
  readonly getOrUndefined: () => T | undefined;
  /**
  - if some: return self
  - if none: return opt
  */
  readonly or: <T2 = T>(opt: Optional<T2>) => Optional<T | T2>;

  /** Same as "or", but uses a thunk instead of a value */
  readonly orThunk: <T2 = T>(makeOption: () => Optional<T2>) => Optional<T | T2>;

  /** Run a function over the 'some' value.
   *  "map" operation on the Optional functor.
   */
  readonly map: <U> (mapper: (x: T) => U) => Optional<U>;

  /** Run a side effect over the 'some' value */
  readonly each: (worker: (x: T) => void) => void;

  /** "bind"/"flatMap" operation on the Optional Bind/Monad.
   *  Equivalent to >>= in Haskell/PureScript; flatMap in Scala.
   */
  readonly bind: <U> (f: (x: T) => Optional<U>) => Optional<U>;

  /** Does this Optional contain a value that predicate? */
  readonly exists: (f: (x: T) => boolean) => boolean;

  /** Do all values contained in this option match this predicate? */
  readonly forall: (f: (x: T) => boolean) => boolean;

  /** Return all values in this Optional that match the predicate.
   *  The predicate may refine the constituent type using TypeScript type predicates.
   */
  readonly filter: {
    <Q extends T>(f: (x: T) => x is Q): Optional<Q>;
    (f: (x: T) => boolean): Optional<T>;
  };

  /** Returns all the values in this Optional as an array */
  readonly toArray: () => T[];

  readonly toString: () => string;
}

const none = <T = never>(): Optional<T> => NONE;

const NONE: Optional<never> = (() => {
  // inlined from peanut, maybe a micro-optimisation?
  const call = (thunk) => thunk();
  const id = Fun.identity;
  const me: Optional<never> = {
    fold: (n, _s) => n(),
    isSome: Fun.never,
    isNone: Fun.always,
    getOr: id,
    getOrThunk: call,
    getOrDie: (msg) => {
      throw new Error(msg || 'error: getOrDie called on none.');
    },
    getOrNull: Fun.constant(null),
    getOrUndefined: Fun.constant(undefined),
    or: id,
    orThunk: call,
    map: none,
    each: Fun.noop,
    bind: none,
    exists: Fun.never,
    forall: Fun.always,
    filter: () => none(),
    toArray: () => [],
    toString: Fun.constant('none()')
  };
  return me;
})();

const some = <T>(a: T): Optional<T> => {
  const constant_a = Fun.constant(a);

  const self = () =>
    // can't Fun.constant this one
    me;

  const bind = <T2> (f: (value: T) => T2) => {
    return f(a);
  };

  const me: Optional<T> = {
    fold: <T2> (n: () => T2, s: (v: T) => T2): T2 => s(a),
    isSome: Fun.always,
    isNone: Fun.never,
    getOr: constant_a,
    getOrThunk: constant_a,
    getOrDie: constant_a,
    getOrNull: constant_a,
    getOrUndefined: constant_a,
    or: self,
    orThunk: self,
    map: (f) => some(f(a)),
    each: (f) => {
      f(a);
    },
    bind,
    exists: bind,
    forall: bind,
    filter: (f) => f(a) ? me : NONE,
    toArray: () => [ a ],
    toString: () => 'some(' + a + ')'
  };
  return me;
};

const from = <T>(value: T | undefined | null): Optional<T> => value === null || value === undefined ? NONE : some(value);

export const Optional = {
  some,
  none,
  from
};
