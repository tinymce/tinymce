import { Arr, Cell, Obj, Type } from '@ephox/katamari';

/**
 * I18n class that handles translation of TinyMCE UI.
 * Uses po style with csharp style parameters.
 *
 * @class tinymce.util.I18n
 */

export interface RawString {
  raw: string;
}

type Primitive = string | number | boolean | Record<string | number, any> | Function;

export type TokenisedString = [ string, ...Primitive[] ];

export type Untranslated = Primitive | TokenisedString | RawString | null | undefined;

export type TranslatedString = string;

const isDuplicated = (items: string[], item: string) => {
  const firstIndex = items.indexOf(item);
  return firstIndex !== -1 && items.indexOf(item, firstIndex + 1) > firstIndex;
};

const isRaw = (str: any): str is RawString => Type.isObject(str) && Obj.has(str, 'raw');

const isTokenised = (str: any): str is TokenisedString => Type.isArray(str) && str.length > 1;

const data: Record<string, Record<string, string>> = {};
const currentCode = Cell('en');

const getLanguageData = () => Obj.get(data, currentCode.get());

const getData = (): Record<string, Record<string, string>> => Obj.map(data, (value) => ({ ...value }));

/**
 * Sets the current language code.
 *
 * @method setCode
 * @param {String} newCode Current language code.
 */
const setCode = (newCode: string): void => {
  if (newCode) {
    currentCode.set(newCode);
  }
};

/**
 * Returns the current language code.
 *
 * @method getCode
 * @return {String} Current language code.
 */
const getCode = (): string => currentCode.get();

/**
 * Adds translations for a specific language code.
 * Translation keys are set to be case insensitive.
 *
 * @method add
 * @param {String} code Language code like sv_SE.
 * @param {Object} items Name/value object where key is english and value is the translation.
 */
const add = (code: string, items: Record<string, string>): void => {
  let langData = data[code];

  if (!langData) {
    data[code] = langData = {};
  }

  const lcNames = Arr.map(Obj.keys(items), (name) => name.toLowerCase());
  Obj.each(items, (translation, name) => {
    const lcName = name.toLowerCase();
    if (lcName !== name && isDuplicated(lcNames, lcName)) {
      if (!Obj.has(items, lcName)) {
        langData[lcName] = translation;
      }
      langData[name] = translation;
    } else {
      langData[lcName] = translation;
    }
  });
};

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
const translate = (text: Untranslated): TranslatedString => {
  const langData: Record<string, string> = getLanguageData().getOr({});
  /*
   * number - string
   * null, undefined and empty string - empty string
   * array - comma-delimited string
   * object - in [object Object]
   * function - in [object Function]
   */
  const toString = (obj: Untranslated) => {
    if (Type.isFunction(obj)) {
      return Object.prototype.toString.call(obj);
    }
    return !isEmpty(obj) ? '' + obj : '';
  };

  const isEmpty = (text: Untranslated) => text === '' || text === null || text === undefined;

  const getLangData = (text: Untranslated) => {
    // make sure we work on a string and return a string
    const textStr = toString(text);
    return Obj.has(langData, textStr)
      ? toString(langData[textStr])
      : Obj.get(langData, textStr.toLowerCase()).map(toString).getOr(textStr);
  };

  const removeContext = (str: string) => str.replace(/{context:\w+}$/, '');

  // empty strings
  if (isEmpty(text)) {
    return '';
  }

  // Raw, already translated
  if (isRaw(text)) {
    return toString(text.raw);
  }

  // Tokenised {translations}
  if (isTokenised(text)) {
    const values = text.slice(1);
    const substitued = getLangData(text[0]).replace(/\{([0-9]+)\}/g, ($1, $2) => Obj.has(values, $2) ? toString(values[$2]) : $1);
    return removeContext(substitued);
  }

  // straight forward translation mapping
  return removeContext(getLangData(text));
};

/**
 * Returns true/false if the currently active language pack is rtl or not.
 *
 * @method isRtl
 * @return {Boolean} True if the current language pack is rtl.
 */
const isRtl = (): boolean => getLanguageData()
  .bind((items) => Obj.get(items, '_dir'))
  .exists((dir) => dir === 'rtl');

/**
 * Returns true/false if specified language pack exists.
 *
 * @method hasCode
 * @param {String} code Code to check for.
 * @return {Boolean} True if the current language pack for the specified code exists.
 */
const hasCode = (code: string): boolean => Obj.has(data, code);

interface I18n {
  getData: () => Record<string, Record<string, string>>;
  setCode: (newCode: string) => void;
  getCode: () => string;
  add: (code: string, items: Record<string, string>) => void;
  translate: (text: Untranslated) => TranslatedString;
  isRtl: () => boolean;
  hasCode: (code: string) => boolean;
}

const I18n: I18n = {
  getData,
  setCode,
  getCode,
  add,
  translate,
  isRtl,
  hasCode
};

export default I18n;
