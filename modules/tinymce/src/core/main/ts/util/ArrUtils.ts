import { Obj, Type } from '@ephox/katamari';

/**
 * Array utility class.
 *
 * @private
 * @class tinymce.util.Arr
 */

export type ArrayCallback<T, R> = (this: any, x: T, i: number, xs: ArrayLike<T>) => R;
export type ObjCallback<T, R> = (this: any, value: T, key: string, obj: Record<string, T>) => R;

const isArrayLike = <T>(o: Record<string, T> | ArrayLike<T>): o is ArrayLike<T> =>
  o.length !== undefined;

const isArray = Array.isArray;

const toArray = <T>(obj: ArrayLike<T>): T[] => {
  if (!isArray(obj)) {
    const array: T[] = [];
    for (let i = 0, l = obj.length; i < l; i++) {
      array[i] = obj[i];
    }
    return array;
  } else {
    return obj;
  }
};

const each: {
  <T>(arr: ArrayLike<T> | null | undefined, cb: ArrayCallback<T, void | boolean>, scope?: any): boolean;
  <T>(obj: Record<string, T> | null | undefined, cb: ObjCallback<T, void | boolean>, scope?: any): boolean;
} = <T>(o: ArrayLike<T> | Record<string, T> | null | undefined, cb: ArrayCallback<T, void | boolean> | ObjCallback<T, void | boolean>, s?: any): boolean => {
  if (!o) {
    return false;
  }

  s = s || o;

  if (isArrayLike(o)) {
    // Indexed arrays, needed for Safari
    for (let n = 0, l = o.length; n < l; n++) {
      if ((cb as ArrayCallback<T, void | boolean>).call(s, o[n], n, o) === false) {
        return false;
      }
    }
  } else {
    // Hashtables
    for (const n in o) {
      if (Obj.has(o, n)) {
        if ((cb as ObjCallback<T, void | boolean>).call(s, o[n], n, o) === false) {
          return false;
        }
      }
    }
  }

  return true;
};

const map: {
  <T, R>(arr: ArrayLike<T> | null | undefined, cb: ArrayCallback<T, R>): R[];
  <T, R>(obj: Record<string, T> | null | undefined, cb: ObjCallback<T, R>): R[];
} = <T, R>(array: any, callback: any): R[] => {
  const out: R[] = [];

  each<T>(array, (item, index) => {
    out.push(callback(item, index, array));
  });

  return out;
};

const filter: {
  <T>(arr: ArrayLike<T> | null | undefined, f?: ArrayCallback<T, boolean>): T[];
  <T>(obj: Record<string, T> | null | undefined, f?: ObjCallback<T, boolean>): T[];
} = <T>(a: any, f?: any): T[] => {
  const o: T[] = [];

  each<T>(a, (v, index) => {
    if (!f || f(v, index, a)) {
      o.push(v);
    }
  });

  return o;
};

const indexOf = <T>(a: ArrayLike<T>, v: T): number => {
  if (a) {
    for (let i = 0, l = a.length; i < l; i++) {
      if (a[i] === v) {
        return i;
      }
    }
  }

  return -1;
};

const reduce: {
  <T, R>(collection: ArrayLike<T>, iteratee: (acc: R, item: T, index: number) => R, accumulator: R, thisArg?: any): R;
  <T>(collection: ArrayLike<T>, iteratee: (acc: T, item: T, index: number) => T, accumulator?: undefined, thisArg?: any): T;
} = <R>(collection: ArrayLike<R>, iteratee: (acc: R, item: R, index: number) => R, accumulator?: R | undefined, thisArg?: any): R => {
  let acc: R = Type.isUndefined(accumulator) ? collection[0] : accumulator;

  for (let i = 0; i < collection.length; i++) {
    acc = iteratee.call(thisArg, acc, collection[i], i);
  }

  return acc;
};

const findIndex = <T>(array: ArrayLike<T>, predicate: ArrayCallback<T, boolean>, thisArg?: any): number => {
  for (let i = 0, l = array.length; i < l; i++) {
    if (predicate.call(thisArg, array[i], i, array)) {
      return i;
    }
  }

  return -1;
};

const find = <T>(array: ArrayLike<T>, predicate: ArrayCallback<T, boolean>, thisArg?: any): T | undefined => {
  const idx = findIndex(array, predicate, thisArg);

  if (idx !== -1) {
    return array[idx];
  }

  return undefined;
};

const last = <T>(collection: ArrayLike<T>): T | undefined =>
  collection[collection.length - 1];

export {
  isArrayLike,
  isArray,
  toArray,
  each,
  map,
  filter,
  indexOf,
  reduce,
  findIndex,
  find,
  last
};
