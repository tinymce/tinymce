import { Arr, Optional } from '@ephox/katamari';
import { Pattern, Search } from '@ephox/polaris';

import { WordScope } from '../data/WordScope';
import * as WordSanitiser from '../util/WordSanitiser';

// Returns: [array of WordScope Struct] containing all words from string allText
const words = (allText: string): WordScope[] => {
  const pattern = Pattern.unsafetoken(Pattern.wordchar() + '+');
  const matches = Search.findall(allText, pattern);
  const len = allText.length;

  // FIX ... I may possibly index strings elsewhere.
  return Arr.map(matches, (x) => {
    const start = x.start;
    const finish = x.finish;
    const text = allText.substring(start, finish);
    const prev = start > 0 ? Optional.some(allText.charAt(start - 1)) : Optional.none<string>();
    const next = finish < len ? Optional.some(allText.charAt(finish)) : Optional.none<string>();
    const r = WordScope(text, prev, next);
    return WordSanitiser.scope(r);
  });
};

export {
  words
};
