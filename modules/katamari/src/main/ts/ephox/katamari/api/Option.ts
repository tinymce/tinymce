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
  toArray: () => T[];
  toString: () => string;
}

const none = <T = any>() => <Option<T>> NONE;

const NONE: Option<any> = (() => {
  // inlined from peanut, maybe a micro-optimisation?
  const call = (thunk) => thunk();
  const id = (n) => n;
  const noop = () => { };
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
    each: noop,
    bind: none,
    exists: Fun.never,
    forall: Fun.always,
    filter: none,
    toArray () { return []; },
    toString: Fun.constant('none()')
  };
  if (Object.freeze) {
    Object.freeze(me);
  }
  return me;
})();

const some = <T>(a: T): Option<T> => {

  const self = () => {
    // can't Fun.constant this one
    return me;
  };

  const me: Option<T> = {
    fold: <T2> (n: () => T2, s: (v: T) => T2): T2 => s(a),
    is: (v: T): boolean => a === v,
    isSome: Fun.always,
    isNone: Fun.never,
    getOr: (): T => a,
    getOrThunk: (f) => a,
    getOrDie: () => a,
    getOrNull: () => a,
    getOrUndefined: () => a,
    or: self,
    orThunk: self,
    map: <T2> (f: (value: T) => T2) => some(f(a)),
    each: (f: (value: T) => void): void => {
      f(a);
    },
    bind: <T2>(f: (value: T) => Option<T2>) => f(a),
    exists: (f: (value: T) => boolean) => f(a),
    forall: (f: (value: T) => boolean) => f(a),
    filter: <Q extends T>(f: (value: T) => value is Q): Option<Q> =>
      f(a) ? me as Option<Q> : NONE,
    toArray: () => [a],
    toString: () => 'some(' + a + ')',
  };
  return me;
};

const from = <T>(value: T | undefined | null): Option<NonNullable<T>> => value === null || value === undefined ? NONE : some(value as NonNullable<T>);

export const Option = {
  some,
  none,
  from
};
