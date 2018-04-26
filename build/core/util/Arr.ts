/**
 * Arr.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Array utility class.
 *
 * @private
 * @class tinymce.util.Arr
 */

const isArray = Array.isArray;

const toArray = function (obj) {
  let array = obj, i, l;

  if (!isArray(obj)) {
    array = [];
    for (i = 0, l = obj.length; i < l; i++) {
      array[i] = obj[i];
    }
  }

  return array;
};

const each = function (o, cb, s?) {
  let n, l;

  if (!o) {
    return 0;
  }

  s = s || o;

  if (o.length !== undefined) {
    // Indexed arrays, needed for Safari
    for (n = 0, l = o.length; n < l; n++) {
      if (cb.call(s, o[n], n, o) === false) {
        return 0;
      }
    }
  } else {
    // Hashtables
    for (n in o) {
      if (o.hasOwnProperty(n)) {
        if (cb.call(s, o[n], n, o) === false) {
          return 0;
        }
      }
    }
  }

  return 1;
};

const map = function (array, callback) {
  const out = [];

  each(array, function (item, index) {
    out.push(callback(item, index, array));
  });

  return out;
};

const filter = function (a, f?) {
  const o = [];

  each(a, function (v, index) {
    if (!f || f(v, index, a)) {
      o.push(v);
    }
  });

  return o;
};

const indexOf = function (a, v) {
  let i, l;

  if (a) {
    for (i = 0, l = a.length; i < l; i++) {
      if (a[i] === v) {
        return i;
      }
    }
  }

  return -1;
};

const reduce = function (collection, iteratee, accumulator?, thisArg?) {
  let i = 0;

  if (arguments.length < 3) {
    accumulator = collection[0];
  }

  for (; i < collection.length; i++) {
    accumulator = iteratee.call(thisArg, accumulator, collection[i], i);
  }

  return accumulator;
};

const findIndex = function (array, predicate, thisArg?) {
  let i, l;

  for (i = 0, l = array.length; i < l; i++) {
    if (predicate.call(thisArg, array[i], i, array)) {
      return i;
    }
  }

  return -1;
};

const find = function (array, predicate, thisArg?) {
  const idx = findIndex(array, predicate, thisArg);

  if (idx !== -1) {
    return array[idx];
  }

  return undefined;
};

const last = function (collection) {
  return collection[collection.length - 1];
};

export default {
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