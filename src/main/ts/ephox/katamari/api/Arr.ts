import { Option } from './Option';
import Type from './Type';

type Morphism<T, U> = (a: T) => U;
type Catamorphism<T, U> = (acc: U, x: T) => U;
type ArrayMorphism<T, U> = (x: T, i: number, xs: ReadonlyArray<T>) => U;
type ArrayPredicate<T> = ArrayMorphism<T, boolean>;
type Predicate<T> = Morphism<T, boolean>;
type Comparator<T> = (a: T, b: T) => number;

// Use the native Array.indexOf if it is available (IE9+) otherwise fall back to manual iteration
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
const rawIndexOf = (() => {
  const pIndexOf = Array.prototype.indexOf;

  const fastIndex = (xs, x) => pIndexOf.call(xs, x);

  const slowIndex = (xs, x) => slowIndexOf(xs, x);

  return pIndexOf === undefined ? slowIndex : fastIndex;
})();

const indexOf = <T = any>(xs: ReadonlyArray<T>, x: T): Option<number> => {
  // The rawIndexOf method does not wrap up in an option. This is for performance reasons.
  const r = rawIndexOf(xs, x);
  return r === -1 ? Option.none() : Option.some(r);
};

const contains = <T = any>(xs: ReadonlyArray<T>, x: T): boolean => {
  return rawIndexOf(xs, x) > -1;
};

// Using findIndex is likely less optimal in Chrome (dynamic return type instead of bool)
// but if we need that micro-optimisation we can inline it later.
const exists = <T = any>(xs: ReadonlyArray<T>, pred: ArrayPredicate<T>): boolean => {
  return findIndex(xs, pred).isSome();
};

const range = <T = any>(num: number, f: Morphism<number, T>): T[] => {
  const r: T[] = [];
  for (let i = 0; i < num; i++) {
    r.push(f(i));
  }
  return r;
};

// It's a total micro optimisation, but these do make some difference.
// Particularly for browsers other than Chrome.
// - length caching
// http://jsperf.com/browser-diet-jquery-each-vs-for-loop/69
// - not using push
// http://jsperf.com/array-direct-assignment-vs-push/2

const chunk = <T = any>(array: ReadonlyArray<T>, size: number): T[][] => {
  const r: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    const s = array.slice(i, i + size);
    r.push(s);
  }
  return r;
};

const map = <T = any, U = any>(xs: ReadonlyArray<T>, f: ArrayMorphism<T, U>): U[] => {
  // pre-allocating array size when it's guaranteed to be known
  // http://jsperf.com/push-allocated-vs-dynamic/22
  const len = xs.length;
  const r = new Array(len);
  for (let i = 0; i < len; i++) {
    const x = xs[i];
    r[i] = f(x, i, xs);
  }
  return r;
};

// Unwound implementing other functions in terms of each.
// The code size is roughly the same, and it should allow for better optimisation.
// const each = function<T, U>(xs: T[], f: (x: T, i?: number, xs?: T[]) => void): void {
const each = <T = any>(xs: ReadonlyArray<T>, f: ArrayMorphism<T, void>): void => {
  for (let i = 0, len = xs.length; i < len; i++) {
    const x = xs[i];
    f(x, i, xs);
  }
};

const eachr = <T = any>(xs: ReadonlyArray<T>, f: ArrayMorphism<T, void>): void => {
  for (let i = xs.length - 1; i >= 0; i--) {
    const x = xs[i];
    f(x, i, xs);
  }
};

const partition = <T = any>(xs: ReadonlyArray<T>, pred: ArrayPredicate<T>): { pass: T[], fail: T[] } => {
  const pass = [];
  const fail = [];
  for (let i = 0, len = xs.length; i < len; i++) {
    const x = xs[i];
    const arr = pred(x, i, xs) ? pass : fail;
    arr.push(x);
  }
  return { pass: pass, fail: fail };
};

const filter = <T = any>(xs: ReadonlyArray<T>, pred: ArrayPredicate<T>): T[] => {
  const r = [];
  for (let i = 0, len = xs.length; i < len; i++) {
    const x = xs[i];
    if (pred(x, i, xs)) {
      r.push(x);
    }
  }
  return r;
};

/*
 * Groups an array into contiguous arrays of like elements. Whether an element is like or not depends on f.
 *
 * f is a function that derives a value from an element - e.g. true or false, or a string.
 * Elements are like if this function generates the same value for them (according to ===).
 *
 *
 * Order of the elements is preserved. Arr.flatten() on the result will return the original list, as with Haskell groupBy function.
 *  For a good explanation, see the group function (which is a special case of groupBy)
 *  http://hackage.haskell.org/package/base-4.7.0.0/docs/Data-List.html#v:group
 */
const groupBy = <T = any>(xs: ReadonlyArray<T>, f: Morphism<T, any>): T[][] => {
  if (xs.length === 0) {
    return [];
  } else {
    let wasType = f(xs[0]); // initial case for matching
    const r = [];
    let group = [];

    for (let i = 0, len = xs.length; i < len; i++) {
      const x = xs[i];
      const type = f(x);
      if (type !== wasType) {
        r.push(group);
        group = [];
      }
      wasType = type;
      group.push(x);
    }
    if (group.length !== 0) {
      r.push(group);
    }
    return r;
  }
};

const foldr = <T = any, U = any>(xs: ReadonlyArray<T>, f: Catamorphism<T, U>, acc: U): U => {
  eachr(xs, function (x) {
    acc = f(acc, x);
  });
  return acc;
};

const foldl = <T = any, U = any>(xs: ReadonlyArray<T>, f: Catamorphism<T, U>, acc: U): U => {
  each(xs, function (x) {
    acc = f(acc, x);
  });
  return acc;
};

const find = <T = any>(xs: ReadonlyArray<T>, pred: ArrayPredicate<T>): Option<T> => {
  for (let i = 0, len = xs.length; i < len; i++) {
    const x = xs[i];
    if (pred(x, i, xs)) {
      return Option.some(x);
    }
  }
  return Option.none();
};

const findIndex = <T = any>(xs: ReadonlyArray<T>, pred: ArrayPredicate<T>): Option<number> => {
  for (let i = 0, len = xs.length; i < len; i++) {
    const x = xs[i];
    if (pred(x, i, xs)) {
      return Option.some(i);
    }
  }

  return Option.none();
};

const slowIndexOf = <T = any>(xs: ReadonlyArray<T>, x: T): number => {
  for (let i = 0, len = xs.length; i < len; ++i) {
    if (xs[i] === x) {
      return i;
    }
  }

  return -1;
};

const push = Array.prototype.push;
const flatten = <T = any>(xs: T[][]): T[] => {
  // Note, this is possible because push supports multiple arguments:
  // http://jsperf.com/concat-push/6
  // Note that in the past, concat() would silently work (very slowly) for array-like objects.
  // With this change it will throw an error.
  const r = [];
  for (let i = 0, len = xs.length; i < len; ++i) {
    // Ensure that each value is an array itself
    if (!Array.prototype.isPrototypeOf(xs[i])) throw new Error('Arr.flatten item ' + i + ' was not an array, input: ' + xs);
    push.apply(r, xs[i]);
  }
  return r;
};

const bind = <T = any, U = any>(xs: ReadonlyArray<T>, f: ArrayMorphism<T, U[]>): U[] => {
  const output = map(xs, f);
  return flatten(output);
};

const forall = <T = any>(xs: ReadonlyArray<T>, pred: ArrayPredicate<T>): boolean => {
  for (let i = 0, len = xs.length; i < len; ++i) {
    const x = xs[i];
    if (pred(x, i, xs) !== true) {
      return false;
    }
  }
  return true;
};

const equal = <T = any>(a1: ReadonlyArray<T>, a2: T[]) => {
  return a1.length === a2.length && forall(a1, (x, i) => x === a2[i]);
};

const slice = Array.prototype.slice;
const reverse = <T = any>(xs: ReadonlyArray<T>): T[] => {
  const r = slice.call(xs, 0);
  r.reverse();
  return r;
};

const difference = <T = any>(a1: ReadonlyArray<T>, a2: ReadonlyArray<T>): T[] => {
  return filter(a1, (x) => !contains(a2, x));
};

const mapToObject = <T = any, U = any>(xs: ReadonlyArray<T>, f: (x: T, i: number) => U): Record<string, U> => {
  const r: Record<string, U> = {};
  for (let i = 0, len = xs.length; i < len; i++) {
    const x = xs[i];
    r[String(x)] = f(x, i);
  }
  return r;
};

const pure = <T = any>(x: T): T[] => [x];

const sort = <T = any>(xs: ReadonlyArray<T>, comparator?: Comparator<T>): T[] => {
  const copy: T[] = slice.call(xs, 0);
  copy.sort(comparator);
  return copy;
};

const head = <T = any>(xs: ReadonlyArray<T>): Option<T> => xs.length === 0 ? Option.none() : Option.some(xs[0]);

const last = <T = any>(xs: ReadonlyArray<T>): Option<T> => xs.length === 0 ? Option.none() : Option.some(xs[xs.length - 1]);

const from: <T = any>(x: ArrayLike<T>) => T[] = Type.isFunction(Array.from) ? Array.from : (x) => slice.call(x)

export default {
  map,
  each,
  eachr,
  partition,
  filter,
  groupBy,
  indexOf,
  foldr,
  foldl,
  find,
  findIndex,
  flatten,
  bind,
  forall,
  exists,
  contains,
  equal,
  reverse,
  chunk,
  difference,
  mapToObject,
  pure,
  sort,
  range,
  head,
  last,
  from
};