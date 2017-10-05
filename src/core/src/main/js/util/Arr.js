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
define(
  'tinymce.core.util.Arr',
  [
  ],
  function () {
    var isArray = Array.isArray || function (obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    };

    var toArray = function (obj) {
      var array = obj, i, l;

      if (!isArray(obj)) {
        array = [];
        for (i = 0, l = obj.length; i < l; i++) {
          array[i] = obj[i];
        }
      }

      return array;
    };

    var each = function (o, cb, s) {
      var n, l;

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

    var map = function (array, callback) {
      var out = [];

      each(array, function (item, index) {
        out.push(callback(item, index, array));
      });

      return out;
    };

    var filter = function (a, f) {
      var o = [];

      each(a, function (v, index) {
        if (!f || f(v, index, a)) {
          o.push(v);
        }
      });

      return o;
    };

    var indexOf = function (a, v) {
      var i, l;

      if (a) {
        for (i = 0, l = a.length; i < l; i++) {
          if (a[i] === v) {
            return i;
          }
        }
      }

      return -1;
    };

    var reduce = function (collection, iteratee, accumulator, thisArg) {
      var i = 0;

      if (arguments.length < 3) {
        accumulator = collection[0];
      }

      for (; i < collection.length; i++) {
        accumulator = iteratee.call(thisArg, accumulator, collection[i], i);
      }

      return accumulator;
    };

    var findIndex = function (array, predicate, thisArg) {
      var i, l;

      for (i = 0, l = array.length; i < l; i++) {
        if (predicate.call(thisArg, array[i], i, array)) {
          return i;
        }
      }

      return -1;
    };

    var find = function (array, predicate, thisArg) {
      var idx = findIndex(array, predicate, thisArg);

      if (idx !== -1) {
        return array[idx];
      }

      return undefined;
    };

    var last = function (collection) {
      return collection[collection.length - 1];
    };

    return {
      isArray: isArray,
      toArray: toArray,
      each: each,
      map: map,
      filter: filter,
      indexOf: indexOf,
      reduce: reduce,
      findIndex: findIndex,
      find: find,
      last: last
    };
  }
);