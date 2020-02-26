import { Universe } from '@ephox/boss';
import { Option } from '@ephox/katamari';
import { WordRange } from '../data/WordRange';
import * as CurrentWord from '../util/CurrentWord';
import * as EndofWord from './EndofWord';

/*  Given an initial position (item, offset), identify the optional selection range which represents the
 *  word that (item, offset) is on. The start of the word and the end of the word is NOT considered
 *  on that word. Returns none if no word can be identified containing offset.
 */
const word = function <E, D> (universe: Universe<E, D>, item: E, offset: number): Option<WordRange<E>> {
  if (!universe.property().isText(item)) {
    return Option.none();
  }
  const text = universe.property().getText(item);

  // Identify the index of a word break before the current offset and after the current offset
  // if possible.
  const breaks = CurrentWord.around(text, offset);
  return breaks.before().fold(function () {
    return breaks.after().fold(function () {
      return EndofWord.neither(universe, item, offset);
    }, function (a) {
      return EndofWord.after(universe, item, offset, a);
    });
  }, function (b) {
    return breaks.after().fold(function () {
      return EndofWord.before(universe, item, offset, b);
    }, function (a) {
      return EndofWord.both(universe, item, offset, b, a);
    });
  });
};

export {
  word
};
