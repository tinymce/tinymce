import { Fun, Unicode } from '@ephox/katamari';

import { punctuationStr } from '../words/UnicodeData';

// \w is a word character
// "'" is an apostrophe
// '-' is a hyphen
// \u00AD is a soft hyphen

// (https://en.wikipedia.org/wiki/List_of_Unicode_characters#Latin_Extended-A)
// \u00C0 - \u00FF are various language characters (Latin-1)
// \u0100 - \u017F are various language characters (Latin Extended-A)
// \u2018 and \u2019 are the smart quote characters
// \u00AD is a soft hyphen (SHY) character
const charsStr = '\\w' + `'` + '\\-' + Unicode.softHyphen + '\\u0100-\\u017F\\u00C0-\\u00FF' + Unicode.zeroWidth + '\\u2018\\u2019';
const wordbreakStr = '[^' + charsStr + ']';
const wordcharStr = '[' + charsStr + ']';

const chars = Fun.constant(charsStr);
const wordbreak = Fun.constant(wordbreakStr);
const wordchar = Fun.constant(wordcharStr);
const punctuation = Fun.constant(punctuationStr);

export {
  chars,
  punctuation,
  wordbreak,
  wordchar
};
