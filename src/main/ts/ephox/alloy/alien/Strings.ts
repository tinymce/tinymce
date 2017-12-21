// TODO: Migrate to katamari

var checkRange = function (str, substr, start) {
  if (substr === '') return true;
  if (str.length < substr.length) return false;
  var x = str.substr(start, start + substr.length);
  return x === substr;
};

/** Does 'str' start with 'prefix'?
 *  Note: all strings start with the empty string.
 *        More formally, for all strings x, startsWith(x, "").
 *        This is so that for all strings x and y, startsWith(y + x, y)
 */
var startsWith = function (str, prefix) {
  return checkRange(str, prefix, 0);
};

export default <any> {
  startsWith: startsWith
};