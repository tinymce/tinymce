import { Unicode, Fun } from '@ephox/katamari';

// \w is a word character
// \' is an apostrophe
// '-' is a hyphen

// (https://en.wikipedia.org/wiki/List_of_Unicode_characters#Latin_Extended-A)
// \u00C0 - \u00FF are various language characters (Latin-1)
// \u0100 - \u017F are various language characters (Latin Extended-A)
// \u2018 and \u2019 are the smart quote characters
const chars = '\\w' + '\'' + '\\-' + '\\u0100-\\u017F\\u00C0-\\u00FF' + Unicode.zeroWidth() + '\\u2018\\u2019';
const wordbreak = '[^' + chars + ']';
const wordchar = '[' + chars + ']';

export default {
  chars: Fun.constant(chars) as () => string,
  wordbreak: Fun.constant(wordbreak) as () => string,
  wordchar: Fun.constant(wordchar) as () => string
};