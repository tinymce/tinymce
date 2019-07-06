import * as StrAppend from '../str/StrAppend';
import * as StringParts from '../str/StringParts';

const checkRange = function (str: string, substr: string, start: number) {
  if (substr === '') {
    return true;
  }
  if (str.length < substr.length) {
    return false;
  }
  const x = str.substr(start, start + substr.length);
  return x === substr;
};

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

export const removeTrailing = function (str: string, prefix: string) {
  return endsWith(str, prefix) ? StrAppend.removeFromEnd(str, prefix.length) : str;
};

export const ensureLeading = function (str: string, prefix: string) {
  return startsWith(str, prefix) ? str : StrAppend.addToStart(str, prefix);
};

export const ensureTrailing = function (str: string, prefix: string) {
  return endsWith(str, prefix) ? str : StrAppend.addToEnd(str, prefix);
};

export const contains = function (str: string, substr: string) {
  return str.indexOf(substr) !== -1;
};

export const capitalize = function (str: string) {
  return StringParts.head(str).bind(function (head) {
    return StringParts.tail(str).map(function (tail) {
      return head.toUpperCase() + tail;
    });
  }).getOr(str);
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

/** removes all leading and trailing spaces */
export const trim = function (str: string) {
  return str.replace(/^\s+|\s+$/g, '');
};

export const lTrim = function (str: string) {
  return str.replace(/^\s+/g, '');
};

export const rTrim = function (str: string) {
  return str.replace(/\s+$/g, '');
};
