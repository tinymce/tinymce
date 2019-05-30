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
  or: (opt: Option<T>) => Option<T>;
  orThunk: (makeOption: () => Option<T>) => Option<T>;
  map: <T2> (mapper: (x: T) => T2) => Option<T2>;
  ap: <T2> (optfab: Option<(a: T) => T2>) => Option<T2>;
  each: (worker: (x: T) => void) => void;
  bind: <T2> (f: (x: T) => Option<T2>) => Option<T2>;
  /** convert an Option<Option<A>> to Option<A> */
  flatten: () => Option<any>; // TODO: find a way to express in the typesystem
  exists: (f: (x: T) => boolean) => boolean;
  forall: (f: (x: T) => boolean) => boolean;
  filter: (f: (x: T) => boolean) => Option<T>;
  equals: (opt: Option<T>) => boolean;
  equals_: <T2> (opt: Option<T2>, equality: (a: T, b: T2) => boolean) => boolean;
  toArray: () => T[];
  toString: () => string;
};

const never: () => false = Fun.never;
const always: () => true = Fun.always;

/**
  Option objects support the following methods:

  fold :: this Option a -> ((() -> b, a -> b)) -> Option b

  is :: this Option a -> a -> Boolean

  isSome :: this Option a -> () -> Boolean

  isNone :: this Option a -> () -> Boolean

  getOr :: this Option a -> a -> a

  getOrThunk :: this Option a -> (() -> a) -> a

  getOrDie :: this Option a -> String -> a

  or :: this Option a -> Option a -> Option a
    - if some: return self
    - if none: return opt

  orThunk :: this Option a -> (() -> Option a) -> Option a
    - Same as "or", but uses a thunk instead of a value

  map :: this Option a -> (a -> b) -> Option b
    - "fmap" operation on the Option Functor.
    - same as 'each'

  ap :: this Option a -> Option (a -> b) -> Option b
    - "apply" operation on the Option Apply/Applicative.
    - Equivalent to <*> in Haskell/PureScript.

  each :: this Option a -> (a -> b) -> undefined
    - similar to 'map', but doesn't return a value.
    - intended for clarity when performing side effects.

  bind :: this Option a -> (a -> Option b) -> Option b
    - "bind"/"flatMap" operation on the Option Bind/Monad.
    - Equivalent to >>= in Haskell/PureScript; flatMap in Scala.

  flatten :: {this Option (Option a))} -> () -> Option a
    - "flatten"/"join" operation on the Option Monad.

  exists :: this Option a -> (a -> Boolean) -> Boolean

  forall :: this Option a -> (a -> Boolean) -> Boolean

  filter :: this Option a -> (a -> Boolean) -> Option a

  equals :: this Option a -> Option a -> Boolean

  equals_ :: this Option a -> (Option a, a -> Boolean) -> Boolean

  toArray :: this Option a -> () -> [a]

*/

const none = function<T = any> () { return <Option<T>> NONE; };

const NONE: Option<any> = (function () {
  const eq = function (o) {
    return o.isNone();
  };

  // inlined from peanut, maybe a micro-optimisation?
  const call = function (thunk) { return thunk(); };
  const id = function (n) { return n; };
  const noop = function () { };
  const nul = function() { return null; };
  const undef = function() { return undefined; };

  const me: Option<any> = {
    fold: function (n, s) { return n(); },
    is: never,
    isSome: never,
    isNone: always,
    getOr: id,
    getOrThunk: call,
    getOrDie: function (msg) {
      throw new Error(msg || 'error: getOrDie called on none.');
    },
    getOrNull: nul,
    getOrUndefined: undef,
    or: id,
    orThunk: call,
    map: none,
    ap: none,
    each: noop,
    bind: none,
    flatten: none,
    exists: never,
    forall: always,
    filter: none,
    equals: eq,
    equals_: eq,
    toArray: function () { return []; },
    toString: Fun.constant('none()')
  };
  if (Object.freeze) Object.freeze(me);
  return me;
})();


/** some :: a -> Option a */
const some = function <T> (a: T): Option<T> {

  // inlined from peanut, maybe a micro-optimisation?
  const constant_a = function () { return a; };

  const self = function () {
    // can't Fun.constant this one
    return me;
  };

  const map = function <T2> (f: (value: T) => T2) {
    return some(f(a));
  };

  const bind = function <T2> (f: (value: T) => T2) {
    return f(a);
  };

  const me: Option<T> = {
    fold: function <T2> (n: () => T2, s: (v: T) => T2) { return s(a); },
    is: function (v: T) { return a === v; },
    isSome: always,
    isNone: never,
    getOr: constant_a,
    getOrThunk: constant_a,
    getOrDie: constant_a,
    getOrNull: constant_a,
    getOrUndefined: constant_a,
    or: self,
    orThunk: self,
    map: map,
    ap: function <T2> (optfab: Option<(a: T) => T2>) {
      return optfab.fold(<() => Option<T2>>none, function(fab) {
        return some(fab(a));
      });
    },
    each: function (f: (value: T) => void) {
      f(a);
    },
    bind: bind,
    flatten: <any>constant_a,
    exists: bind,
    forall: bind,
    filter: function (f: (value: T) => boolean) {
      return f(a) ? me : <Option<T>>NONE;
    },
    equals: function (o: Option<T>) {
      return o.is(a);
    },
    equals_: function <T2> (o: Option<T2>, elementEq: (a: T, b: T2) => boolean) {
      return o.fold(
        never,
        function (b) { return elementEq(a, b); }
      );
    },
    toArray: function () {
      return [a];
    },
    toString: function () {
      return 'some(' + a + ')';
    }
  };
  return me;
};

/** from :: undefined|null|a -> Option a */
const from = function <T> (value: T | undefined | null): Option<NonNullable<T>> {
  return value === null || value === undefined ? NONE : some(value as NonNullable<T>);
};

export const Option = {
  some: some,
  none: none,
  from: from
};