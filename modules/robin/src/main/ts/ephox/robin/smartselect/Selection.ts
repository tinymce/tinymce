import { Universe } from '@ephox/boss';
import { Optional } from '@ephox/katamari';

import { WordRange } from '../data/WordRange';
import * as CurrentWord from '../util/CurrentWord';
import * as EndofWord from './EndofWord';

/*  Given an initial position (item, offset), identify the optional selection range which represents the
 *  word that (item, offset) is on. The start of the word and the end of the word is NOT considered
 *  on that word. Returns none if no word can be identified containing offset.
 */
const word = <E, D>(universe: Universe<E, D>, item: E, offset: number): Optional<WordRange<E>> => {
  if (!universe.property().isText(item)) {
    return Optional.none();
  }
  const text = universe.property().getText(item);

  // Identify the index of a word break before the current offset and after the current offset
  // if possible.
  const breaks = CurrentWord.around(text, offset);
  return breaks.before.fold(() => {
    return breaks.after.fold(() => {
      return EndofWord.neither(universe, item, offset);
    }, (a) => {
      return EndofWord.after(universe, item, offset, a);
    });
  }, (b) => {
    return breaks.after.fold(() => {
      return EndofWord.before(universe, item, offset, b);
    }, (a) => {
      return EndofWord.both(universe, item, offset, b, a);
    });
  });
};

export {
  word
};
