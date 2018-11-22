/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from './Tools';

/**
 * I18n class that handles translation of TinyMCE UI.
 * Uses po style with csharp style parameters.
 *
 * @class tinymce.util.I18n
 */

const data = {};
let code = 'en';

export default {
  /**
   * Sets the current language code.
   *
   * @method setCode
   * @param {String} newCode Current language code.
   */
  setCode (newCode) {
    if (newCode) {
      code = newCode;
      this.rtl = this.data[newCode] ? this.data[newCode]._dir === 'rtl' : false;
    }
  },

  /**
   * Returns the current language code.
   *
   * @method getCode
   * @return {String} Current language code.
   */
  getCode () {
    return code;
  },

  /**
   * Property gets set to true if a RTL language pack was loaded.
   *
   * @property rtl
   * @type Boolean
   */
  rtl: false,

  /**
   * Adds translations for a specific language code.
   *
   * @method add
   * @param {String} code Language code like sv_SE.
   * @param {Array} items Name/value array with English en_US to sv_SE.
   */
  add (code, items) {
    let langData = data[code];

    if (!langData) {
      data[code] = langData = {};
    }

    for (const name in items) {
      langData[name] = items[name];
    }

    this.setCode(code);
  },

  /**
   * Translates the specified text.
   *
   * It has a few formats:
   * I18n.translate("Text");
   * I18n.translate(["Text {0}/{1}", 0, 1]);
   * I18n.translate({raw: "Raw string"});
   *
   * @method translate
   * @param {String/Object/Array} text Text to translate.
   * @return {String} String that got translated.
   */
  translate (text) {
    const langData = data[code] || {};

    /**
     * number - string
     * null, undefined and empty string - empty string
     * array - comma-delimited string
     * object - in [object Object]
     * function - in [object Function]
     *
     * @param obj
     * @returns {string}
     */
    const toString = function (obj) {
      if (Tools.is(obj, 'function')) {
        return Object.prototype.toString.call(obj);
      }
      return !isEmpty(obj) ? '' + obj : '';
    };

    const isEmpty = function (text) {
      return text === '' || text === null || Tools.is(text, 'undefined');
    };

    const getLangData = function (text) {
      // make sure we work on a string and return a string
      text = toString(text);
      return Tools.hasOwn(langData, text) ? toString(langData[text]) : text;
    };

    if (isEmpty(text)) {
      return '';
    }

    if (Tools.is(text, 'object') && Tools.hasOwn(text, 'raw')) {
      return toString(text.raw);
    }

    if (Tools.is(text, 'array')) {
      const values = text.slice(1);
      text = getLangData(text[0]).replace(/\{([0-9]+)\}/g, function ($1, $2) {
        return Tools.hasOwn(values, $2) ? toString(values[$2]) : $1;
      });
    }

    return getLangData(text).replace(/{context:\w+}$/, '');
  },

  data
};