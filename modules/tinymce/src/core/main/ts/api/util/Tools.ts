import { Obj, Type } from '@ephox/katamari';

import * as ArrUtils from '../../util/ArrUtils';
import Env from '../Env';

type ArrayCallback<T, R> = ArrUtils.ArrayCallback<T, R>;
type ObjCallback<T, R> = ArrUtils.ObjCallback<T, R>;
type WalkCallback<T> = (this: any, o: T, i: string, n: keyof T | undefined) => boolean | void;

interface Tools {
  is: (obj: any, type?: string) => boolean;
  isArray: <T>(arr: any) => arr is Array<T>;
  inArray: <T>(arr: ArrayLike<T>, value: T) => number;
  grep: {
    <T>(arr: ArrayLike<T> | null | undefined, pred?: ArrayCallback<T, boolean>): T[];
    <T>(arr: Record<string, T> | null | undefined, pred?: ObjCallback<T, boolean>): T[];
  };
  trim: (str: string | null | undefined) => string;
  toArray: <T>(obj: ArrayLike<T>) => T[];
  hasOwn: (obj: any, name: string) => boolean;
  makeMap: (items: ArrayLike<string> | string | undefined, delim?: string | RegExp, map?: Record<string, {}>) => Record<string, {}>;
  each: {
    <T>(arr: ArrayLike<T> | null | undefined, cb: ArrayCallback<T, void | boolean>, scope?: any): boolean;
    <T>(obj: Record<string, T> | null | undefined, cb: ObjCallback<T, void | boolean>, scope?: any): boolean;
  };
  map: {
    <T, R>(arr: ArrayLike<T> | null | undefined, cb: ArrayCallback<T, R>): R[];
    <T, R>(obj: Record<string, T> | null | undefined, cb: ObjCallback<T, R>): R[];
  };
  extend: (obj: Object, ext: Object, ...objs: Object[]) => any;
  walk: <T extends Record<string, any>>(obj: T, f: WalkCallback<T>, n?: keyof T, scope?: any) => void;
  resolve: (path: string, o?: Object) => any;
  explode: (s: string | string[], d?: string | RegExp) => string[];
  _addCacheSuffix: (url: string) => string;
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

const trim = (str: string | null | undefined): string => {
  return Type.isNullable(str) ? '' : ('' + str).replace(whiteSpaceRegExp, '');
};

/**
 * Checks if a object is of a specific type for example an array.
 *
 * @method is
 * @param {Object} obj Object to check type of.
 * @param {String} type Optional type to check for.
 * @return {Boolean} true/false if the object is of the specified type.
 */
const is = (obj: any, type?: string): boolean => {
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
const makeMap = (items: ArrayLike<string> | string | undefined, delim?: string | RegExp, map: Record<string, {}> = {}): Record<string, {}> => {
  const resolvedItems = Type.isString(items) ? items.split(delim || ',') : (items || []);

  let i = resolvedItems.length;
  while (i--) {
    map[resolvedItems[i]] = {};
  }

  return map;
};

/**
 * JavaScript does not protect hasOwnProperty method, so it is possible to overwrite it. This is
 * an object independent version.
 * Checks if the input object "<code>obj</code>" has the property "<code>prop</code>".
 *
 * @method hasOwnProperty
 * @param {Object} obj Object to check if the property exists.
 * @param {String} prop Name of a property on the object.
 * @returns {Boolean} true if the object has the specified property.
 */
const hasOwnProperty = Obj.has;

const extend = (obj: any, ...exts: any[]): any => {
  for (let i = 0; i < exts.length; i++) {
    const ext = exts[i];
    for (const name in ext) {
      if (Obj.has(ext, name)) {
        const value = ext[name];
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
 * @param {Function} f Function to call for each item.
 * @param {String} n Optional name of collection inside the objects to walk for example childNodes.
 * @param {String} s Optional scope to execute the function in.
 */
const walk = function <T extends Record<string, any>>(this: any, o: T, f: WalkCallback<T>, n?: keyof T, s?: any): void {
  s = s || this;

  if (o) {
    if (n) {
      o = o[n];
    }

    ArrUtils.each<T>(o, (o, i) => {
      if (f.call(s, o, i, n) === false) {
        return false;
      } else {
        walk(o, f, n, s);
        return true;
      }
    });
  }
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
 * const obj = tinymce.resolve('a.b.c.d');
 */
const resolve = (n: string, o: any = window): any => {
  const path = n.split('.');
  for (let i = 0, l = path.length; i < l; i++) {
    o = o[path[i]];

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
 * @param {String} s String to split.
 * @param {String} d Delimiter to split by.
 * @example
 * // Split a string into an array with a,b,c
 * const arr = tinymce.explode('a, b,   c');
 */
const explode = (s: string | string[], d?: string | RegExp): string[] => {
  if (Type.isArray(s)) {
    return s;
  } else if (s === '') {
    return [];
  } else {
    return ArrUtils.map(s.split(d || ','), trim);
  }
};

const _addCacheSuffix = (url: string): string => {
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
   * @return {Boolean} true/false state if the object is an array or not.
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
   * Performs an iteration of all items in a collection such as an object or array. This method will execute the
   * callback function for each item in the collection, if the callback returns false the iteration will terminate.
   * The callback has the following format: `cb(value, key_or_index)`.
   *
   * @method each
   * @param {Object} o Collection to iterate.
   * @param {Function} cb Callback function to execute for each item.
   * @param {Object} s Optional scope to execute the callback in.
   * @example
   * // Iterate an array
   * tinymce.each([ 1,2,3 ], (v, i) => {
   *   console.debug("Value: " + v + ", Index: " + i);
   * });
   *
   * // Iterate an object
   * tinymce.each({ a: 1, b: 2, c: 3 }, (v, k) => {
   *   console.debug("Value: " + v + ", Key: " + k);
   * });
   */
  each: ArrUtils.each,

  /**
   * Creates a new array by the return value of each iteration function call. This enables you to convert
   * one array list into another.
   *
   * @method map
   * @param {Array} array Array of items to iterate.
   * @param {Function} callback Function to call for each item. It's return value will be the new value.
   * @return {Array} Array with new values based on function return values.
   */
  map: ArrUtils.map,

  /**
   * Filters out items from the input array by calling the specified function for each item.
   * If the function returns false the item will be excluded if it returns true it will be included.
   *
   * @method grep
   * @param {Array} a Array of items to loop though.
   * @param {Function} f Function to call for each item. Include/exclude depends on it's return value.
   * @return {Array} New array with values imported and filtered based in input.
   * @example
   * // Filter out some items, this will return an array with 4 and 5
   * const items = tinymce.grep([ 1,2,3,4,5 ], (v) => v > 3);
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
  walk,
  resolve,
  explode,
  _addCacheSuffix
};

export default Tools;
