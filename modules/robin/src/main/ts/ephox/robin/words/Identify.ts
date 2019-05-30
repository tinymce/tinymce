import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Pattern } from '@ephox/polaris';
import { Search } from '@ephox/polaris';
import WordScope from '../data/WordScope';
import WordSanitiser from '../util/WordSanitiser';

// Returns: [array of WordScope Struct] containing all words from string allText
var words = function (allText) {
  var pattern = Pattern.unsafetoken(Pattern.wordchar() + '+');
  var matches = Search.findall(allText, pattern);
  var len = allText.length;

  // FIX ... I may possibly index strings elsewhere.
  return Arr.map(matches, function (x) {
    var start = x.start();
    var finish = x.finish();
    var text = allText.substring(start, finish);
    var prev = start > 0 ? Option.some(allText.charAt(start - 1)) : Option.none();
    var next = finish < len ? Option.some(allText.charAt(finish)) : Option.none();
    var r = WordScope(text, prev, next);
    return WordSanitiser.scope(r);
  });
};

export default <any> {
  words: words
};