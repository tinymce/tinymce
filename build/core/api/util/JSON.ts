/**
 * JSON.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

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

const serialize = function (o, quote?) {
  let i, v, t, name;

  quote = quote || '"';

  if (o === null) {
    return 'null';
  }

  t = typeof o;

  if (t === 'string') {
    v = '\bb\tt\nn\ff\rr\""\'\'\\\\';

    /*eslint no-control-regex:0 */
    return quote + o.replace(/([\u0080-\uFFFF\x00-\x1f\"\'\\])/g, function (a, b) {
      // Make sure single quotes never get encoded inside double quotes for JSON compatibility
      if (quote === '"' && a === '\'') {
        return a;
      }

      i = v.indexOf(b);

      if (i + 1) {
        return '\\' + v.charAt(i + 1);
      }

      a = b.charCodeAt().toString(16);

      return '\\u' + '0000'.substring(a.length) + a;
    }) + quote;
  }

  if (t === 'object') {
    if (o.hasOwnProperty && Object.prototype.toString.call(o) === '[object Array]') {
      for (i = 0, v = '['; i < o.length; i++) {
        v += (i > 0 ? ',' : '') + serialize(o[i], quote);
      }

      return v + ']';
    }

    v = '{';

    for (name in o) {
      if (o.hasOwnProperty(name)) {
        v += typeof o[name] !== 'function' ? (v.length > 1 ? ',' + quote : quote) + name +
          quote + ':' + serialize(o[name], quote) : '';
      }
    }

    return v + '}';
  }

  return '' + o;
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
   * @param {string} s JSON String to parse into a JavaScript object.
   * @return {Object} Object from input JSON string or undefined if it failed.
   */
  parse (text) {
    try {
      return JSON.parse(text);
    } catch (ex) {
      // Ignore
    }
  }

  /**#@-*/
};