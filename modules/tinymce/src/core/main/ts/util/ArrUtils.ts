/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Type } from '@ephox/katamari';

/**
 * Array utility class.
 *
 * @private
 * @class tinymce.util.Arr
 */

export type ArrayCallback<T, R> = (x: T, i: number, xs: ReadonlyArray<T>) => R;
export type ObjCallback<T, R> = (value: T, key: string, obj: Record<string, T>) => R;

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
} = (o, cb, s?): boolean => {
  let n, l;

  if (!o) {
    return false;
  }

  s = s || o;

  if (o.length !== undefined) {
    // Indexed arrays, needed for Safari
    for (n = 0, l = o.length; n < l; n++) {
      if (cb.call(s, o[n], n, o) === false) {
        return false;
      }
    }
  } else {
    // Hashtables
    for (n in o) {
      if (o.hasOwnProperty(n)) {
        if (cb.call(s, o[n], n, o) === false) {
          return false;
        }
      }
    }
  }

  return true;
};

const map: {
  <T, R>(arr: ArrayLike<T> | null | undefined, cb: ArrayCallback<T, R>): R[];
  <T, R>(obj: Record<string | null | undefined, T>, cb: ObjCallback<T, R>): R[];
} = <T, R>(array, callback): R[] => {
  const out: R[] = [];

  each<T>(array, function (item, index) {
    out.push(callback(item, index, array));
  });

  return out;
};

const filter: {
  <T>(arr: ArrayLike<T> | null | undefined, f?: ArrayCallback<T, boolean>): T[];
  <T>(obj: Record<string, T> | null | undefined, f?: ObjCallback<T, boolean>): T[];
} = <T>(a, f?): T[] => {
  const o: T[] = [];

  each<T>(a, function (v, index) {
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
} = <T, R>(collection, iteratee, accumulator?, thisArg?): R => {
  let acc: R = Type.isUndefined(accumulator) ? collection[0] : accumulator;

  for (let i = 0; i < collection.length; i++) {
    acc = iteratee.call(thisArg, acc, collection[i], i);
  }

  return acc;
};

const findIndex = <T>(array: ArrayLike<T>, predicate: ArrayCallback<T, boolean>, thisArg?: any): number => {
  let i, l;

  for (i = 0, l = array.length; i < l; i++) {
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
