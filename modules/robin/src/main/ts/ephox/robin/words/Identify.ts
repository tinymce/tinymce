import { Arr, Fun, Optional } from '@ephox/katamari';
import { Words } from '@ephox/polaris';

import { WordScope } from '../data/WordScope';
import * as WordSanitiser from '../util/WordSanitiser';

// Returns: [array of WordScope Struct] containing all words from string allText
const words = (allText: string): WordScope[] => {
  const { words, indices } = Words.getWordsWithIndices(allText.split(''), Fun.identity);
  const len = allText.length;

  return Arr.map(words, (word, i) => {
    const index = indices[i];
    const start = index.start;
    const end = index.end;
    const text = word.join('');
    const prev = start > 0 ? Optional.some(allText.charAt(start - 1)) : Optional.none<string>();
    const next = end < len ? Optional.some(allText.charAt(end)) : Optional.none<string>();
    const r = WordScope(text, prev, next);
    return WordSanitiser.scope(r);
  });
};

export {
  words
};
