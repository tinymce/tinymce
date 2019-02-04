/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Type } from '@ephox/katamari';

/**
 * JSON parser and serializer class.
 *
 * @class tinymce.util.JSON
 * @static
 * @example
 * // JSON parse a string into an object
 * var obj = tinymce.util.JSON.parse(somestring);
 *
 * // JSON serialize a object into an string
 * var str = tinymce.util.JSON.serialize(obj);
 */

const serialize = function (o: any, quote: string = '"') {
  // TODO: Can we just use JSON.stringify here instead?
  if (Type.isNull(o)) {
    return 'null';
  } else if (Type.isNumber(o) || Type.isBoolean(o)) {
    return o.toString();
  } else if (Type.isString(o)) {
    const specialChars = '\bb\tt\nn\ff\rr\""\'\'\\\\';

    /*eslint no-control-regex:0 */
    return quote + o.replace(/([\u0080-\uFFFF\x00-\x1f\"\'\\])/g, (match, group1) => {
      // Make sure single quotes never get encoded inside double quotes for JSON compatibility
      if (quote === '"' && match === '\'') {
        return match;
      }

      const i = specialChars.indexOf(group1);
      if (i !== -1) {
        return '\\' + specialChars.charAt(i + 1);
      }

      const hexCode = group1.charCodeAt(0).toString(16);
      return '\\u' + '0000'.substring(hexCode.length) + hexCode;
    }) + quote;
  } else if (Type.isArray(o)) {
    const content = Arr.foldl(o, (acc, value) => {
      const v = (Type.isFunction(value) || Type.isUndefined(value)) ? 'null' : serialize(value, quote);
      return acc + (acc.length > 0 ? ',' : '') + v;
    }, '');

    return '[' + content + ']';
  } else if (Type.isObject(o)) {
    if (Date.prototype.isPrototypeOf(o)) {
      return quote + o.toISOString() + quote;
    } else {
      const content = Arr.foldl(Obj.keys(o), (acc, key) => {
        const value = o[key];
        if (Type.isFunction(value) || Type.isUndefined(value)) {
          return acc;
        } else {
          return acc + (acc.length > 0 ? ',' : '') + serialize(key, quote) + ':' + serialize(value, quote);
        }
      }, '');

      return '{' + content + '}';
    }
  } else {
    return '';
  }
};

export default {
  /**
   * Serializes the specified object as a JSON string.
   *
   * @method serialize
   * @param {Object} obj Object to serialize as a JSON string.
   * @param {String} quote Optional quote string defaults to ".
   * @return {string} JSON string serialized from input.
   */
  serialize,

  /**
   * Unserializes/parses the specified JSON string into a object.
   *
   * @method parse
   * @param {string} text JSON String to parse into a JavaScript object.
   * @return {Object} Object from input JSON string or undefined if it failed.
   */
  parse (text: string) {
    try {
      return JSON.parse(text);
    } catch (ex) {
      // Ignore
    }
  }

  /**#@-*/
};