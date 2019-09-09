import * as Fun from './Fun';

export interface Option<T> {
  fold: <T2> (whenNone: () => T2, whenSome: (v: T) => T2) => T2;
  is: (value: T) => boolean;
  isSome: () => boolean;
  isNone: () => boolean;
  getOr: (value: T) => T;
  getOrThunk: (makeValue: () => T) => T;
  getOrDie: (msg?: string) => T;
  getOrNull: () => T | null;
  getOrUndefined: () => T | undefined;
  /**
  - if some: return self
  - if none: return opt
  */
  or: (opt: Option<T>) => Option<T>;

  /** Same as "or", but uses a thunk instead of a value */
  orThunk: (makeOption: () => Option<T>) => Option<T>;
  map: <T2> (mapper: (x: T) => T2) => Option<T2>;

  each: (worker: (x: T) => void) => void;

  /** "bind"/"flatMap" operation on the Option Bind/Monad.
   *  Equivalent to >>= in Haskell/PureScript; flatMap in Scala.
   */
  bind: <T2> (f: (x: T) => Option<T2>) => Option<T2>;
  exists: (f: (x: T) => boolean) => boolean;
  forall: (f: (x: T) => boolean) => boolean;
  filter: {
    <Q extends T>(f: (x: T) => x is Q): Option<Q>;
    (f: (x: T) => boolean): Option<T>;
  };
  equals: (opt: Option<T>) => boolean;
  equals_: <T2> (opt: Option<T2>, equality: (a: T, b: T2) => boolean) => boolean;
  toArray: () => T[];
  toString: () => string;
}

const none = <T = any>() => <Option<T>> NONE;

const NONE: Option<any> = (() => {
  const eq = function (o) {
    return o.isNone();
  };

  // inlined from peanut, maybe a micro-optimisation?
  const call = (thunk) => thunk();
  const id = (n) => n;
  const me: Option<any> = {
    fold: (n, s) => n(),
    is: Fun.never,
    isSome: Fun.never,
    isNone: Fun.always,
    getOr: id,
    getOrThunk: call,
    getOrDie (msg) {
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
    toArray () { return []; },
    toString: Fun.constant('none()')
  };
  if (Object.freeze) {
    Object.freeze(me);
  }
  return me;
})();

const some = <T>(a: T): Option<T> => {
  const constant_a = Fun.constant(a);

  const self = () => {
    // can't Fun.constant this one
    return me;
  };

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
    toArray: () => [a],
    toString: () => 'some(' + a + ')',
    equals (o: Option<T>) {
      return o.is(a);
    },
    equals_<T2> (o: Option<T2>, elementEq: (a: T, b: T2) => boolean) {
      return o.fold(
        Fun.never,
        function (b) { return elementEq(a, b); }
      );
    },
  };
  return me;
};

const from = <T>(value: T | undefined | null): Option<NonNullable<T>> => value === null || value === undefined ? NONE : some(value as NonNullable<T>);

export const Option = {
  some,
  none,
  from
};
