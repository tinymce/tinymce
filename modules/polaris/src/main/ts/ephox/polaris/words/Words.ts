import { CharacterMap, classify } from './StringMapper';
import * as UnicodeData from './UnicodeData';
import { isWordBoundary } from './WordBoundary';
import { Unicode } from '@ephox/katamari';

const EMPTY_STRING = UnicodeData.EMPTY_STRING;
const WHITESPACE = UnicodeData.WHITESPACE;
const PUNCTUATION = UnicodeData.PUNCTUATION;

const isProtocol = (str: string): boolean => {
  return str === 'http' || str === 'https';
};

const findWordEnd = (characters: string[], startIndex: number) => {
  let i: number;
  for (i = startIndex; i < characters.length; i++) {
    if (WHITESPACE.test(characters[i])) {
      break;
    }
  }
  return i;
};

const findUrlEnd = (characters: string[], startIndex: number): number => {
  const endIndex = findWordEnd(characters, startIndex + 1);
  const peakedWord = characters.slice(startIndex + 1, endIndex).join(EMPTY_STRING);
  return peakedWord.substr(0, 3) === '://' ? endIndex : startIndex;
};

const findWords = <T>(chars: T[], sChars: string[], characterMap: CharacterMap, options: WordOptions): T[][] => {
  const words: T[][] = [];
  let word: T[] = [];

  // Loop through each character in the classification map and determine whether
  // it precedes a word boundary, building an array of distinct words as we go.
  for (let i = 0; i < characterMap.length; ++i) {

    // Append this character to the current word.
    word.push(chars[i]);

    // If there's a word boundary between the current character and the next character,
    // append the current word to the words array and start building a new word.
    if (isWordBoundary(characterMap, i)) {
      const ch = sChars[i];
      if (
        (options.includeWhitespace || !WHITESPACE.test(ch)) &&
        (options.includePunctuation || !PUNCTUATION.test(ch))
      ) {
        const startOfWord = i - word.length + 1;
        const endOfWord = i + 1;
        const str = sChars.slice(startOfWord, endOfWord).join(EMPTY_STRING);

        if (isProtocol(str)) {
          const endOfUrl = findUrlEnd(sChars, i);
          const url = chars.slice(endOfWord, endOfUrl);
          Array.prototype.push.apply(word, url);
          i = endOfUrl;
        }

        words.push(word);
      }

      word = [];
    }
  }

  return words;
};

export interface WordOptions {
  includeWhitespace?: boolean;
  includePunctuation?: boolean;
}

const getDefaultOptions = (): WordOptions => {
  return {
    includeWhitespace: false,
    includePunctuation: false,
  };
};

const getWords = <T>(chars: T[], extract: (char: T) => string, options?: WordOptions): T[][] => {
  options = {
    ...getDefaultOptions(),
    ...options
  };

  const filteredChars: T[] = [];
  const extractedChars: string[] = [];

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < chars.length; i++) {
    const ch = extract(chars[i]);
    if (ch !== Unicode.zeroWidth) {
      filteredChars.push(chars[i]);
      extractedChars.push(ch);
    }
  }

  const characterMap: CharacterMap = classify(extractedChars);
  return findWords(filteredChars, extractedChars, characterMap, options);
};

export {
  getWords
};
