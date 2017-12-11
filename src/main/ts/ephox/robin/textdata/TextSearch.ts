import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';
import { Unicode } from '@ephox/katamari';

var charpos = Struct.immutable('ch', 'offset');

var locate = function (text, offset) {
  return charpos(text.charAt(offset), offset);
};

var previous = function (text, offsetOption) {
  var max = offsetOption.getOr(text.length);
  for (var i = max - 1; i >= 0; i--) {
    if (text.charAt(i) !== Unicode.zeroWidth()) return Option.some(locate(text, i));
  }
  return Option.none();
};

var next = function (text, offsetOption) {
  var min = offsetOption.getOr(0);
  for (var i = min + 1; i < text.length; i++) {
    if (text.charAt(i) !== Unicode.zeroWidth()) return Option.some(locate(text, i));
  }
  return Option.none();
};

var rfind = function (str, regex) {
  regex.lastIndex = -1;
  var reversed = Arr.reverse(str).join('');
  var match = reversed.match(regex);
  return match !== undefined && match !== null && match.index >= 0 ? Option.some((reversed.length - 1) - match.index) : Option.none();
};

var lfind = function (str, regex) {
  regex.lastIndex = -1;
  var match = str.match(regex);
  return match !== undefined && match !== null && match.index >= 0 ? Option.some(match.index) : Option.none();
};

export default <any> {
  previous: previous,
  next: next,
  rfind: rfind,
  lfind: lfind
};