import { Arr, Option } from '@ephox/katamari';
import { Pattern, Search } from '@ephox/polaris';
import { WordScope } from '../data/WordScope';
import WordSanitiser from '../util/WordSanitiser';

// Returns: [array of WordScope Struct] containing all words from string allText
const words = function (allText: string) {
  const pattern = Pattern.unsafetoken(Pattern.wordchar() + '+');
  const matches = Search.findall(allText, pattern);
  const len = allText.length;

  // FIX ... I may possibly index strings elsewhere.
  return Arr.map(matches, function (x) {
    const start = x.start();
    const finish = x.finish();
    const text = allText.substring(start, finish);
    const prev = start > 0 ? Option.some(allText.charAt(start - 1)) : Option.none<string>();
    const next = finish < len ? Option.some(allText.charAt(finish)) : Option.none<string>();
    const r = WordScope(text, prev, next);
    return WordSanitiser.scope(r);
  });
};

export default {
  words
};