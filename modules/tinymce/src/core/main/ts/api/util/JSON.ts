/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Type } from '@ephox/katamari';

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

const serialize = (obj: {}) => {
  const data = JSON.stringify(obj);

  if (!Type.isString(data)) {
    return data;
  }

  // convert unicode chars to escaped chars
  return data.replace(/[\u0080-\uFFFF]/g, (match) => {
    const hexCode = match.charCodeAt(0).toString(16);
    return '\\u' + '0000'.substring(hexCode.length) + hexCode;
  });
};

interface JSONUtils {
  serialize (obj: {}): string;
  parse (text: string): any;
}

const JSONUtils: JSONUtils = {
  /**
   * Serializes the specified object as a JSON string.
   *
   * @method serialize
   * @param {Object} obj Object to serialize as a JSON string.
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
  parse(text: string): any {
    try {
      return JSON.parse(text);
    } catch (ex) {
      // Ignore
    }
  }
};

export default JSONUtils;