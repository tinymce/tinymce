/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { window } from '@ephox/dom-globals';
import Env from '../Env';
import ArrUtils from '../../util/ArrUtils';

type ArrayCallback<T, R> = (x: T, i: number, xs: ReadonlyArray<T>) => R;
type ObjCallback<T, R> = (value: T[keyof T], key: string, obj: T) => R;

interface Tools {
  is (obj: any, type: string): boolean;
  isArray <T>(T: any): T is ArrayLike<T>;
  inArray <T>(arr: ArrayLike<T>, value: T): number;
  grep <T>(arr: ArrayLike<T>, pred?: ArrayCallback<T, boolean>);
  trim (str: string): string;
  toArray <T>(obj: ArrayLike<T>): T[];
  hasOwn (obj: any, name: string): boolean;
  makeMap <T>(items: ArrayLike<T> | string, delim?: string | RegExp, map?: Record<string, T | string>): Record<string, T | string>;
  each <T>(arr: ReadonlyArray<T>, cb: ArrayCallback<T, any>, scope?: any): void;
  each <T>(obj: T, cb: ObjCallback<T, any>, scope?: any): void;
  map <T, U>(arr: ReadonlyArray<T>, cb: ArrayCallback<T, U>, scope?: any): Array<U>;
  map <T, U>(obj: T, cb: ObjCallback<T, U>, scope?: any): Array<U>;
  extend (obj: {}, ext: {}, ...objs: {}[]): any;
  create (name: string, p: {}, root?: {});
  walk <T = {}>(obj: T, f: Function, n?: keyof T, scope?: any): void;
  createNS (name: string, o?: {}): any;
  resolve (path: string, o?: {}): any;
  explode (s: string, d?: string | RegExp): string[];
  _addCacheSuffix (url: string): string;
}

/**
 * This class contains various utlity functions. These are also exposed
 * directly on the tinymce namespace.
 *
 * @class tinymce.util.Tools
 */

/**
 * Removes whitespace from the beginning and end of a string.
 *
 * @method trim
 * @param {String} s String to remove whitespace from.
 * @return {String} New string with removed whitespace.
 */
const whiteSpaceRegExp = /^\s*|\s*$/g;

const trim = function (str) {
  return (str === null || str === undefined) ? '' : ('' + str).replace(whiteSpaceRegExp, '');
};

/**
 * Checks if a object is of a specific type for example an array.
 *
 * @method is
 * @param {Object} obj Object to check type of.
 * @param {string} type Optional type to check for.
 * @return {Boolean} true/false if the object is of the specified type.
 */
const is = function (obj: Record<string, any> | {}, type: string) {
  if (!type) {
    return obj !== undefined;
  }

  if (type === 'array' && ArrUtils.isArray(obj)) {
    return true;
  }

  return typeof obj === type;
};

/**
 * Makes a name/object map out of an array with names.
 *
 * @method makeMap
 * @param {Array/String} items Items to make map out of.
 * @param {String} delim Optional delimiter to split string by.
 * @param {Object} map Optional map to add items to.
 * @return {Object} Name/value map of items.
 */
const makeMap = function (items, delim?, map?) {
  let i;

  items = items || [];
  delim = delim || ',';

  if (typeof items === 'string') {
    items = items.split(delim);
  }

  map = map || {};

  i = items.length;
  while (i--) {
    map[items[i]] = {};
  }

  return map;
};

/**
 * JavaScript does not protect hasOwnProperty method, so it is possible to overwrite it. This is
 * object independent version.
 *
 * @param {Object} obj
 * @param {String} prop
 * @returns {Boolean}
 */
const hasOwnProperty = function (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

/**
 * Creates a class, subclass or static singleton.
 * More details on this method can be found in the Wiki.
 *
 * @method create
 * @param {String} s Class name, inheritance and prefix.
 * @param {Object} p Collection of methods to add to the class.
 * @param {Object} root Optional root object defaults to the global window object.
 * @example
 * // Creates a basic class
 * tinymce.create('tinymce.somepackage.SomeClass', {
 *     SomeClass: function() {
 *         // Class constructor
 *     },
 *
 *     method: function() {
 *         // Some method
 *     }
 * });
 *
 * // Creates a basic subclass class
 * tinymce.create('tinymce.somepackage.SomeSubClass:tinymce.somepackage.SomeClass', {
 *     SomeSubClass: function() {
 *         // Class constructor
 *         this.parent(); // Call parent constructor
 *     },
 *
 *     method: function() {
 *         // Some method
 *         this.parent(); // Call parent method
 *     },
 *
 *     'static': {
 *         staticMethod: function() {
 *             // Static method
 *         }
 *     }
 * });
 *
 * // Creates a singleton/static class
 * tinymce.create('static tinymce.somepackage.SomeSingletonClass', {
 *     method: function() {
 *         // Some method
 *     }
 * });
 */
const create = function (s, p, root?) {
  const self = this;
  let sp, ns, cn, scn, c, de = 0;

  // Parse : <prefix> <class>:<super class>
  s = /^((static) )?([\w.]+)(:([\w.]+))?/.exec(s);
  cn = s[3].match(/(^|\.)(\w+)$/i)[2]; // Class name

  // Create namespace for new class
  ns = self.createNS(s[3].replace(/\.\w+$/, ''), root);

  // Class already exists
  if (ns[cn]) {
    return;
  }

  // Make pure static class
  if (s[2] === 'static') {
    ns[cn] = p;

    if (this.onCreate) {
      this.onCreate(s[2], s[3], ns[cn]);
    }

    return;
  }

  // Create default constructor
  if (!p[cn]) {
    p[cn] = function () { };
    de = 1;
  }

  // Add constructor and methods
  ns[cn] = p[cn];
  self.extend(ns[cn].prototype, p);

  // Extend
  if (s[5]) {
    sp = self.resolve(s[5]).prototype;
    scn = s[5].match(/\.(\w+)$/i)[1]; // Class name

    // Extend constructor
    c = ns[cn];
    if (de) {
      // Add passthrough constructor
      ns[cn] = function () {
        return sp[scn].apply(this, arguments);
      };
    } else {
      // Add inherit constructor
      ns[cn] = function () {
        this.parent = sp[scn];
        return c.apply(this, arguments);
      };
    }
    ns[cn].prototype[cn] = ns[cn];

    // Add super methods
    self.each(sp, function (f, n) {
      ns[cn].prototype[n] = sp[n];
    });

    // Add overridden methods
    self.each(p, function (f, n) {
      // Extend methods if needed
      if (sp[n]) {
        ns[cn].prototype[n] = function () {
          this.parent = sp[n];
          return f.apply(this, arguments);
        };
      } else {
        if (n !== cn) {
          ns[cn].prototype[n] = f;
        }
      }
    });
  }

  // Add static methods
  /*jshint sub:true*/
  /*eslint dot-notation:0*/
  self.each(p.static, function (f, n) {
    ns[cn][n] = f;
  });
};

const extend = function (obj, ext, ...x: any[]) {
  let i, l, name;
  const args = arguments;
  let value;

  for (i = 1, l = args.length; i < l; i++) {
    ext = args[i];
    for (name in ext) {
      if (ext.hasOwnProperty(name)) {
        value = ext[name];

        if (value !== undefined) {
          obj[name] = value;
        }
      }
    }
  }

  return obj;
};

/**
 * Executed the specified function for each item in a object tree.
 *
 * @method walk
 * @param {Object} o Object tree to walk though.
 * @param {function} f Function to call for each item.
 * @param {String} n Optional name of collection inside the objects to walk for example childNodes.
 * @param {String} s Optional scope to execute the function in.
 */
const walk = function (o, f, n?, s?) {
  s = s || this;

  if (o) {
    if (n) {
      o = o[n];
    }

    ArrUtils.each(o, function (o, i) {
      if (f.call(s, o, i, n) === false) {
        return false;
      }

      walk(o, f, n, s);
    });
  }
};

/**
 * Creates a namespace on a specific object.
 *
 * @method createNS
 * @param {String} n Namespace to create for example a.b.c.d.
 * @param {Object} o Optional object to add namespace to, defaults to window.
 * @return {Object} New namespace object the last item in path.
 * @example
 * // Create some namespace
 * tinymce.createNS('tinymce.somepackage.subpackage');
 *
 * // Add a singleton
 * var tinymce.somepackage.subpackage.SomeSingleton = {
 *     method: function() {
 *         // Some method
 *     }
 * };
 */
const createNS = function (n, o?) {
  let i, v;

  o = o || window;

  n = n.split('.');
  for (i = 0; i < n.length; i++) {
    v = n[i];

    if (!o[v]) {
      o[v] = {};
    }

    o = o[v];
  }

  return o;
};

/**
 * Resolves a string and returns the object from a specific structure.
 *
 * @method resolve
 * @param {String} n Path to resolve for example a.b.c.d.
 * @param {Object} o Optional object to search though, defaults to window.
 * @return {Object} Last object in path or null if it couldn't be resolved.
 * @example
 * // Resolve a path into an object reference
 * var obj = tinymce.resolve('a.b.c.d');
 */
const resolve = function (n, o?) {
  let i, l;

  o = o || window;

  n = n.split('.');
  for (i = 0, l = n.length; i < l; i++) {
    o = o[n[i]];

    if (!o) {
      break;
    }
  }

  return o;
};

/**
 * Splits a string but removes the whitespace before and after each value.
 *
 * @method explode
 * @param {string} s String to split.
 * @param {string} d Delimiter to split by.
 * @example
 * // Split a string into an array with a,b,c
 * var arr = tinymce.explode('a, b,   c');
 */
const explode = function (s, d?) {
  if (!s || is(s, 'array')) {
    return s;
  }

  return ArrUtils.map(s.split(d || ','), trim);
};

const _addCacheSuffix = function (url) {
  const cacheSuffix = Env.cacheSuffix;

  if (cacheSuffix) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + cacheSuffix;
  }

  return url;
};

const Tools: Tools = {
  trim,

  /**
   * Returns true/false if the object is an array or not.
   *
   * @method isArray
   * @param {Object} obj Object to check.
   * @return {boolean} true/false state if the object is an array or not.
   */
  isArray: ArrUtils.isArray,

  is,

  /**
   * Converts the specified object into a real JavaScript array.
   *
   * @method toArray
   * @param {Object} obj Object to convert into array.
   * @return {Array} Array object based in input.
   */
  toArray: ArrUtils.toArray,
  makeMap,

  /**
   * Performs an iteration of all items in a collection such as an object or array. This method will execure the
   * callback function for each item in the collection, if the callback returns false the iteration will terminate.
   * The callback has the following format: cb(value, key_or_index).
   *
   * @method each
   * @param {Object} o Collection to iterate.
   * @param {function} cb Callback function to execute for each item.
   * @param {Object} s Optional scope to execute the callback in.
   * @example
   * // Iterate an array
   * tinymce.each([1,2,3], function(v, i) {
   *     console.debug("Value: " + v + ", Index: " + i);
   * });
   *
   * // Iterate an object
   * tinymce.each({a: 1, b: 2, c: 3], function(v, k) {
   *     console.debug("Value: " + v + ", Key: " + k);
   * });
   */
  each: ArrUtils.each,

  /**
   * Creates a new array by the return value of each iteration function call. This enables you to convert
   * one array list into another.
   *
   * @method map
   * @param {Array} array Array of items to iterate.
   * @param {function} callback Function to call for each item. It's return value will be the new value.
   * @return {Array} Array with new values based on function return values.
   */
  map: ArrUtils.map,

  /**
   * Filters out items from the input array by calling the specified function for each item.
   * If the function returns false the item will be excluded if it returns true it will be included.
   *
   * @method grep
   * @param {Array} a Array of items to loop though.
   * @param {function} f Function to call for each item. Include/exclude depends on it's return value.
   * @return {Array} New array with values imported and filtered based in input.
   * @example
   * // Filter out some items, this will return an array with 4 and 5
   * var items = tinymce.grep([1,2,3,4,5], function(v) {return v > 3;});
   */
  grep: ArrUtils.filter,

  /**
   * Returns an index of the item or -1 if item is not present in the array.
   *
   * @method inArray
   * @param {any} item Item to search for.
   * @param {Array} arr Array to search in.
   * @return {Number} index of the item or -1 if item was not found.
   */
  inArray: ArrUtils.indexOf,

  hasOwn: hasOwnProperty,

  extend,
  create,
  walk,
  createNS,
  resolve,
  explode,
  _addCacheSuffix
};

export default Tools;