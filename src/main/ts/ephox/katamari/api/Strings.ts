import StrAppend from '../str/StrAppend';
import StringParts from '../str/StringParts';

var checkRange = function(str: string, substr: string, start: number) {
  if (substr === '') return true;
  if (str.length < substr.length) return false;
  var x = str.substr(start, start + substr.length);
  return x === substr;
};

/** Given a string and object, perform template-replacements on the string, as specified by the object.
 * Any template fields of the form ${name} are replaced by the string or number specified as obj["name"]
 * Based on Douglas Crockford's 'supplant' method for template-replace of strings. Uses different template format.
 */
var supplant = function(str: string, obj: {[key: string]: string | number}) {
  var isStringOrNumber = function(a) {
    var t = typeof a;
    return t === 'string' || t === 'number';
  };

  return str.replace(/\$\{([^{}]*)\}/g,
    function (fullMatch: string, key: string) {
      var value = obj[key];
      return isStringOrNumber(value) ? value.toString() : fullMatch;
    }
  );
};

var removeLeading = function (str: string, prefix: string) {
  return startsWith(str, prefix) ? StrAppend.removeFromStart(str, prefix.length) : str;
};

var removeTrailing = function (str: string, prefix: string) {
  return endsWith(str, prefix) ? StrAppend.removeFromEnd(str, prefix.length) : str;
};

var ensureLeading = function (str: string, prefix: string) {
  return startsWith(str, prefix) ? str : StrAppend.addToStart(str, prefix);
};

var ensureTrailing = function (str: string, prefix: string) {
  return endsWith(str, prefix) ? str : StrAppend.addToEnd(str, prefix);
};

var contains = function(str: string, substr: string) {
  return str.indexOf(substr) !== -1;
};

var capitalize = function(str: string) {
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
var startsWith = function(str: string, prefix: string) {
  return checkRange(str, prefix, 0);
};

/** Does 'str' end with 'suffix'?
 *  Note: all strings end with the empty string.
 *        More formally, for all strings x, endsWith(x, "").
 *        This is so that for all strings x and y, endsWith(x + y, y)
 */
var endsWith = function(str: string, suffix: string) {
  return checkRange(str, suffix, str.length - suffix.length);
};


/** removes all leading and trailing spaces */
var trim = function(str: string) {
  return str.replace(/^\s+|\s+$/g, '');
};

var lTrim = function(str: string) {
  return str.replace(/^\s+/g, '');
};

var rTrim = function(str: string) {
  return str.replace(/\s+$/g, '');
};

export default {
  supplant: supplant,
  startsWith: startsWith,
  removeLeading: removeLeading,
  removeTrailing: removeTrailing,
  ensureLeading: ensureLeading,
  ensureTrailing: ensureTrailing,
  endsWith: endsWith,
  contains: contains,
  trim: trim,
  lTrim: lTrim,
  rTrim: rTrim,
  capitalize: capitalize
};