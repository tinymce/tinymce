import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Chars from './Chars';
import Custom from './Custom';

/**
 * Tokens have no prefix or suffix
 */
var token = function (input) {
  return Custom(input, Fun.constant(0), Fun.constant(0), Option.none());
};

/**
 * Words have complex rules as to what a "word break" actually is.
 *
 * These are consumed by the regex and then excluded by prefix/suffix lengths.
 */
var word = function (input) {
  var regex = '((?:^\'?)|(?:' + Chars.wordbreak() + '+\'?))' + input + '((?:\'?$)|(?:\'?' + Chars.wordbreak() + '+))';

  // ASSUMPTION: There are no groups in their input
  var prefix = function (match) {
    return match.length > 1 ? match[1].length : 0;
  };

  var suffix = function (match) {
    return match.length > 2 ? match[2].length : 0;
  };

  return Custom(regex, prefix, suffix, Option.none());
};

export default <any> {
  token: token,
  word: word
};