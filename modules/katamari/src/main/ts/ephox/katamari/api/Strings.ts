import * as StrAppend from '../str/StrAppend';

const nativeFromCodePoint = String.fromCodePoint;

const checkRange = (str: string, substr: string, start: number): boolean =>
  substr === '' || str.length >= substr.length && str.substr(start, start + substr.length) === substr;

/** Given a string and object, perform template-replacements on the string, as specified by the object.
 * Any template fields of the form ${name} are replaced by the string or number specified as obj["name"]
 * Based on Douglas Crockford's 'supplant' method for template-replace of strings. Uses different template format.
 */
export const supplant = function (str: string, obj: {[key: string]: string | number}) {
  const isStringOrNumber = function (a) {
    const t = typeof a;
    return t === 'string' || t === 'number';
  };

  return str.replace(/\$\{([^{}]*)\}/g,
    function (fullMatch: string, key: string) {
      const value = obj[key];
      return isStringOrNumber(value) ? value.toString() : fullMatch;
    }
  );
};

export const removeLeading = function (str: string, prefix: string) {
  return startsWith(str, prefix) ? StrAppend.removeFromStart(str, prefix.length) : str;
};

export const removeTrailing = function (str: string, suffix: string) {
  return endsWith(str, suffix) ? StrAppend.removeFromEnd(str, suffix.length) : str;
};

export const ensureLeading = function (str: string, prefix: string) {
  return startsWith(str, prefix) ? str : StrAppend.addToStart(str, prefix);
};

export const ensureTrailing = function (str: string, suffix: string) {
  return endsWith(str, suffix) ? str : StrAppend.addToEnd(str, suffix);
};

export const contains = function (str: string, substr: string) {
  return str.indexOf(substr) !== -1;
};

export const capitalize = function (str: string) {
  return str === '' ? '' : str.charAt(0).toUpperCase() + str.substring(1);
};

/** Does 'str' start with 'prefix'?
 *  Note: all strings start with the empty string.
 *        More formally, for all strings x, startsWith(x, "").
 *        This is so that for all strings x and y, startsWith(y + x, y)
 */
export const startsWith = function (str: string, prefix: string) {
  return checkRange(str, prefix, 0);
};

/** Does 'str' end with 'suffix'?
 *  Note: all strings end with the empty string.
 *        More formally, for all strings x, endsWith(x, "").
 *        This is so that for all strings x and y, endsWith(x + y, y)
 */
export const endsWith = function (str: string, suffix: string) {
  return checkRange(str, suffix, str.length - suffix.length);
};

const blank = (r: RegExp) => (s: string): string =>
  s.replace(r, '');

/** removes all leading and trailing spaces */
export const trim: (s: string) => string =
  blank(/^\s+|\s+$/g);

export const lTrim: (s: string) => string =
  blank(/^\s+/g);

export const rTrim: (s: string) => string =
  blank(/\s+$/g);

export const isNotEmpty = (s: string) => s.length > 0;

export const isEmpty = (s: string) => !isNotEmpty(s);

export const repeat = (s: string, count: number) => count <= 0 ? '' : new Array(count + 1).join(s);

// Extract codepoint a la ES2015 String.fromCodePoint
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint
export const fromCodePoint = (...codePoints: number[]): string => {
  if (nativeFromCodePoint) {
    return nativeFromCodePoint(...codePoints);
  } else {
    const codeUnits: number[] = [];
    let codeLen = 0;
    let result = '';
    for (let index = 0, len = codePoints.length; index !== len; ++index) {
      let codePoint = +codePoints[index];
      // correctly handles all cases including `NaN`, `-Infinity`, `+Infinity`
      // The surrounding `!(...)` is required to correctly handle `NaN` cases
      // The (codePoint>>>0) === codePoint clause handles decimals and negatives
      // eslint-disable-next-line no-bitwise
      if (!(codePoint < 0x10FFFF && (codePoint >>> 0) === codePoint)) {
        throw RangeError('Invalid code point: ' + codePoint);
      }
      if (codePoint <= 0xFFFF) { // BMP code point
        codeLen = codeUnits.push(codePoint);
      } else { // Astral code point; split in surrogate halves
        // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        codePoint -= 0x10000;
        codeLen = codeUnits.push(
          // eslint-disable-next-line no-bitwise
          (codePoint >> 10) + 0xD800,  // highSurrogate
          (codePoint % 0x400) + 0xDC00 // lowSurrogate
        );
      }
      if (codeLen >= 0x3fff) {
        result += String.fromCharCode.apply(null, codeUnits);
        codeUnits.length = 0;
      }
    }
    return result + String.fromCharCode.apply(null, codeUnits);
  }
};
