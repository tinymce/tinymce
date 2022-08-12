import * as StrAppend from '../str/StrAppend';
import { Optional } from './Optional';
import * as Type from './Type';

const checkRange = (str: string, substr: string, start: number): boolean =>
  substr === '' || str.length >= substr.length && str.substr(start, start + substr.length) === substr;

/** Given a string and object, perform template-replacements on the string, as specified by the object.
 * Any template fields of the form ${name} are replaced by the string or number specified as obj["name"]
 * Based on Douglas Crockford's 'supplant' method for template-replace of strings. Uses different template format.
 */
export const supplant = (str: string, obj: Record<string, string | number>): string => {
  const isStringOrNumber = (a: unknown): a is string | number => {
    const t = typeof a;
    return t === 'string' || t === 'number';
  };

  return str.replace(/\$\{([^{}]*)\}/g,
    (fullMatch: string, key: string) => {
      const value = obj[key];
      return isStringOrNumber(value) ? value.toString() : fullMatch;
    }
  );
};

export const removeLeading = (str: string, prefix: string): string => {
  return startsWith(str, prefix) ? StrAppend.removeFromStart(str, prefix.length) : str;
};

export const removeTrailing = (str: string, suffix: string): string => {
  return endsWith(str, suffix) ? StrAppend.removeFromEnd(str, suffix.length) : str;
};

export const ensureLeading = (str: string, prefix: string): string => {
  return startsWith(str, prefix) ? str : StrAppend.addToStart(str, prefix);
};

export const ensureTrailing = (str: string, suffix: string): string => {
  return endsWith(str, suffix) ? str : StrAppend.addToEnd(str, suffix);
};

export const contains = (str: string, substr: string, start: number = 0, end?: number): boolean => {
  const idx = str.indexOf(substr, start);
  if (idx !== -1) {
    return Type.isUndefined(end) ? true : idx + substr.length <= end;
  } else {
    return false;
  }
};

export const capitalize = (str: string): string => {
  return str === '' ? '' : str.charAt(0).toUpperCase() + str.substring(1);
};

/** Does 'str' start with 'prefix'?
 *  Note: all strings start with the empty string.
 *        More formally, for all strings x, startsWith(x, "").
 *        This is so that for all strings x and y, startsWith(y + x, y)
 */
export const startsWith = (str: string, prefix: string): boolean => {
  return checkRange(str, prefix, 0);
};

/** Does 'str' end with 'suffix'?
 *  Note: all strings end with the empty string.
 *        More formally, for all strings x, endsWith(x, "").
 *        This is so that for all strings x and y, endsWith(x + y, y)
 */
export const endsWith = (str: string, suffix: string): boolean => {
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

export const isNotEmpty = (s: string): boolean => s.length > 0;

export const isEmpty = (s: string): boolean => !isNotEmpty(s);

export const repeat = (s: string, count: number): string => count <= 0 ? '' : new Array(count + 1).join(s);

export const fromCodePoint = String.fromCodePoint;

export const toInt = (value: string, radix: number = 10): Optional<number> => {
  const num = parseInt(value, radix);
  return isNaN(num) ? Optional.none() : Optional.some(num);
};

export const toFloat = (value: string): Optional<number> => {
  const num = parseFloat(value);
  return isNaN(num) ? Optional.none() : Optional.some(num);
};
