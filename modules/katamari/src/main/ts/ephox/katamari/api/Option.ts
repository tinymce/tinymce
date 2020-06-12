import * as Fun from './Fun';

/** A value which may be Option.some(a) or Option.none().
 *  Useful for representing partiality or pass/fail conditions that produce a value when successful.
 *  Sometimes called a "type-safe alternative to null".
 *  Can be thought of as a list of exactly zero or 1 elements.
 */
export interface Option<T> {
  /** If none, run whenNone; if some(a) run whenSome(a) */
  readonly fold: <T2> (whenNone: () => T2, whenSome: (v: T) => T2) => T2;

  /** is this value some(t)?  */
  readonly is: (t: T) => boolean;

  readonly isSome: () => boolean;
  readonly isNone: () => boolean;

  /** If some(x) return x, otherwise return the specified default value */
  readonly getOr: <T2>(value: T2) => T | T2;

  /** getOr with a thunked default value */
  readonly getOrThunk: <T2>(makeValue: () => T2) => T | T2;

  /** get the 'some' value; throw if none */
  readonly getOrDie: (msg?: string) => T;

  readonly getOrNull: () => T | null;
  readonly getOrUndefined: () => T | undefined;
  /**
  - if some: return self
  - if none: return opt
  */
  readonly or: (opt: Option<T>) => Option<T>;

  /** Same as "or", but uses a thunk instead of a value */
  readonly orThunk: (makeOption: () => Option<T>) => Option<T>;

  /** Run a function over the 'some' value.
   *  "map" operation on the Option functor.
   */
  readonly map: <T2> (mapper: (x: T) => T2) => Option<T2>;

  /** Run a side effect over the 'some' value */
  readonly each: (worker: (x: T) => void) => void;

  /** "bind"/"flatMap" operation on the Option Bind/Monad.
   *  Equivalent to >>= in Haskell/PureScript; flatMap in Scala.
   */
  readonly bind: <T2> (f: (x: T) => Option<T2>) => Option<T2>;

  /** Does this Option contain a value that predicate? */
  readonly exists: (f: (x: T) => boolean) => boolean;

  /** Do all values contained in this option match this predicate? */
  readonly forall: (f: (x: T) => boolean) => boolean;

  /** Return all values in this Option that match the predicate.
   *  The predicate may refine the constituent type using TypeScript type predicates.
   */
  readonly filter: {
    <Q extends T>(f: (x: T) => x is Q): Option<Q>;
    (f: (x: T) => boolean): Option<T>;
  };

  /** Compare two Options using === */
  readonly equals: (opt: Option<T>) => boolean;

  /** Compare two Options using a specified comparator. */
  readonly equals_: <T2> (opt: Option<T2>, equality: (a: T, b: T2) => boolean) => boolean;

  /** Returns all the values in this Option as an array */
  readonly toArray: () => T[];

  readonly toString: () => string;
}

const none = <T>() => <Option<T>> NONE;

const NONE: Option<any> = (() => {
  const eq = function (o) {
    return o.isNone();
  };

  // inlined from peanut, maybe a micro-optimisation?
  const call = (thunk) => thunk();
  const id = (n) => n;
  const me: Option<any> = {
    fold: (n, _s) => n(),
    is: Fun.never,
    isSome: Fun.never,
    isNone: Fun.always,
    getOr: id,
    getOrThunk: call,
    getOrDie(msg) {
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
    filter: none,
    equals: eq,
    equals_: eq,
    toArray() { return []; },
    toString: Fun.constant('none()')
  };
  return me;
})();

const some = <T>(a: T): Option<T> => {
  const constant_a = Fun.constant(a);

  const self = () =>
    // can't Fun.constant this one
    me;

  const bind = function <T2> (f: (value: T) => T2) {
    return f(a);
  };

  const me: Option<T> = {
    fold: <T2> (n: () => T2, s: (v: T) => T2): T2 => s(a),
    is: (v: T): boolean => a === v,
    isSome: Fun.always,
    isNone: Fun.never,
    getOr: constant_a,
    getOrThunk: constant_a,
    getOrDie: constant_a,
    getOrNull: constant_a,
    getOrUndefined: constant_a,
    or: self,
    orThunk: self,
    map: <T2> (f: (value: T) => T2) => some(f(a)),
    each: (f: (value: T) => void): void => {
      f(a);
    },
    bind,
    exists: bind,
    forall: bind,
    filter: <Q extends T>(f: (value: T) => value is Q): Option<Q> =>
      f(a) ? me as Option<Q> : NONE,
    toArray: () => [ a ],
    toString: () => 'some(' + a + ')',
    equals(o: Option<T>) {
      return o.is(a);
    },
    equals_<T2>(o: Option<T2>, elementEq: (a: T, b: T2) => boolean) {
      return o.fold(
        Fun.never,
        function (b) { return elementEq(a, b); }
      );
    }
  };
  return me;
};

const from = <T>(value: T | undefined | null): Option<T> => value === null || value === undefined ? NONE : some(value);

export const Option = {
  some,
  none,
  from
};
