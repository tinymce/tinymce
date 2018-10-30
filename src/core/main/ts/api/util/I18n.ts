/**
 * I18n.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { Type, Obj } from '@ephox/katamari';

import Tools from './Tools';

/**
 * I18n class that handles translation of TinyMCE UI.
 * Uses po style with csharp style parameters.
 *
 * @class tinymce.util.I18n
 */

const data = {};
let code = 'en';

export interface RawString {
  raw: string;
}

export type TokenisedString = string[];

export type Untranslated = any;

export type TranslatedString = string;

export type TranslateIfNeeded = Untranslated | TranslatedString;

const isRaw = (str: any): str is RawString => Type.isObject(str) && Obj.has(str, 'raw');

const isTokenised = (str: any): str is TokenisedString => Type.isArray(str) && str.length > 1;

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
   * Translation keys are set to be case insensitive.
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
      langData[name.toLowerCase()] = items[name];
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
  translate (text: Untranslated): TranslatedString {
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
      return text === '' || text === null || text === undefined;
    };

    const getLangData = function (text) {
      // make sure we work on a string and return a string
      const textstr = toString(text);
      const lowercaseTextstr = textstr.toLowerCase();
      return Tools.hasOwn(langData, lowercaseTextstr) ? toString(langData[lowercaseTextstr]) : textstr;
    };

    const removeContext = function (str: string) {
      return str.replace(/{context:\w+}$/, '');
    };

    const translated = (text): TranslatedString => {
      // TODO: When we figure out how to return a type Translated that fails if you give a String, we implement here
      return text;
    };

    // empty strings
    if (isEmpty(text)) {
      return translated('');
    }

    // Raw, already translated
    if (isRaw(text)) {
      return translated(toString(text.raw));
    }

    // Tokenised {translations}
    if (isTokenised(text)) {
      const values = text.slice(1);
      const substitued = getLangData(text[0]).replace(/\{([0-9]+)\}/g, function ($1, $2) {
        return Tools.hasOwn(values, $2) ? toString(values[$2]) : $1;
      });
      return translated(removeContext(substitued));
    }

    // straight forward translation mapping
    return translated(removeContext(getLangData(text)));
  },

  data
};