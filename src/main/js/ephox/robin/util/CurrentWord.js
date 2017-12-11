import { Option } from '@ephox/katamari';
import BeforeAfter from '../data/BeforeAfter';
import WordUtil from './WordUtil';

/* 
 * Returns an optional before and optional after representing the index positions of the nearest
 * breaks around position in text. Note, that a substring from before to after should represent
 * the word that position is in (when they are set). A value of none for either before or after suggests
 * that there were no breaks in the respective direction from position in text. The before and the 
 * after values will be equal if position is at the start or the end of a word.
 */
var around = function (text, position) {
  var first = text.substring(0, position);
  var before = WordUtil.leftBreak(first).map(function (index) {
    return index + 1;
  });
  var last = text.substring(position);
  var after = WordUtil.rightBreak(last).map(function (index) {
    return position + index;
  });

  var fallback = BeforeAfter(before, after);

  var current = BeforeAfter(Option.some(position), Option.some(position));

  var endOfWord = after.bind(function (a) {
    return position === a ? Option.some(current): Option.none();
  });

  return endOfWord.getOrThunk(function () {
    return before.bind(function (b) {
      return position === b  ? Option.some(current) : Option.none();
    }).getOr(fallback);
  });
};

export default <any> {
  around: around
};