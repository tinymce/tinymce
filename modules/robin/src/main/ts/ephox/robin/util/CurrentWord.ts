import { Option } from '@ephox/katamari';
import { BeforeAfter } from '../data/BeforeAfter';
import WordUtil from './WordUtil';

/*
 * Returns an optional before and optional after representing the index positions of the nearest
 * breaks around position in text. Note, that a substring from before to after should represent
 * the word that position is in (when they are set). A value of none for either before or after suggests
 * that there were no breaks in the respective direction from position in text. The before and the
 * after values will be equal if position is at the start or the end of a word.
 */
const around = function (text: string, position: number) {
  const first = text.substring(0, position);
  const before = WordUtil.leftBreak(first).map(function (index) {
    return index + 1;
  });
  const last = text.substring(position);
  const after = WordUtil.rightBreak(last).map(function (index) {
    return position + index;
  });

  const fallback = BeforeAfter(before, after);

  const current = BeforeAfter(Option.some(position), Option.some(position));

  const endOfWord = after.bind(function (a) {
    return position === a ? Option.some(current) : Option.none<BeforeAfter>();
  });

  return endOfWord.getOrThunk(function () {
    return before.bind(function (b) {
      return position === b ? Option.some(current) : Option.none();
    }).getOr(fallback);
  });
};

export default {
  around
};