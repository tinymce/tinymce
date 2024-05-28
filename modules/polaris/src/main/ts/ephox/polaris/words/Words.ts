import { Arr } from '@ephox/katamari';

import { CharacterMap, classify } from './StringMapper';
import * as UnicodeData from './UnicodeData';
import { characterIndices as ci } from './UnicodeData';
import { isWordBoundary } from './WordBoundary';

const EMPTY_STRING = UnicodeData.EMPTY_STRING;
const WHITESPACE = UnicodeData.WHITESPACE;
const PUNCTUATION = UnicodeData.PUNCTUATION;

const isProtocol = (str: string): boolean => str === 'http' || str === 'https';

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

export type Word<T> = T[];

interface WordIndex {
  readonly start: number;
  readonly end: number;
}

export interface WordsWithIndices<T> {
  readonly words: Word<T>[];
  readonly indices: WordIndex[];
}

// const isAnAcronym = (str: string) => new RegExp(/^([A-Z]\.)+$/).test(str);

interface CouldBeAnAcronym {
  prev: undefined | number | string;
  check: undefined | boolean;
  isTheLast: boolean;
}

const findWordsWithIndices = <T>(chars: Word<T>, sChars: string[], characterMap: CharacterMap, options: WordOptions): WordsWithIndices<T> => {
  const words: Word<T>[] = [];
  const indices: WordIndex[] = [];
  let word: Word<T> = [];

  const couldBeAnAcronym: CouldBeAnAcronym = {
    prev: undefined,
    check: undefined,
    isTheLast: false
  };

  // Loop through each character in the classification map and determine whether
  // it precedes a word boundary, building an array of distinct words as we go.
  for (let i = 0; i < characterMap.length; ++i) {

    // Append this character to the current word.
    word.push(chars[i]);

    const onWordBoundary = isWordBoundary(characterMap, i);
    const dotAfterLetter = sChars[i] === '.' && couldBeAnAcronym.prev === ci.ALETTER;
    const letterAfterDot = characterMap[i] === ci.ALETTER && (couldBeAnAcronym.prev === '.' || couldBeAnAcronym.prev === undefined);
    if (couldBeAnAcronym.check || couldBeAnAcronym.check === undefined) {
      if (dotAfterLetter) {
        couldBeAnAcronym.prev = sChars[i];
        couldBeAnAcronym.check = true;
        if (onWordBoundary) {
          couldBeAnAcronym.isTheLast = true;
        }
      } else if (letterAfterDot && sChars[i + 1] === '.') {
        couldBeAnAcronym.prev = characterMap[i];
        couldBeAnAcronym.check = true;
      } else {
        couldBeAnAcronym.check = false;
      }
    }
    // If there's a word boundary between the current character and the next character,
    // (and this boundary doesn't depend from a dot at the end of an acronym)
    // append the current word to the words array and start building a new word.
    if (onWordBoundary && (couldBeAnAcronym.isTheLast || !couldBeAnAcronym.check)) {
      const ch = sChars[i];
      if (
        (options.includeWhitespace || !WHITESPACE.test(ch)) &&
        (options.includePunctuation || !PUNCTUATION.test(ch) || couldBeAnAcronym.isTheLast)
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
        indices.push({
          start: startOfWord,
          end: endOfWord
        });
      }

      word = [];
      couldBeAnAcronym.prev = undefined;
      couldBeAnAcronym.check = undefined;
      couldBeAnAcronym.isTheLast = false;
    }
  }

  return { words, indices };
};

export interface WordOptions {
  includeWhitespace?: boolean;
  includePunctuation?: boolean;
}

const getDefaultOptions = (): WordOptions => ({
  includeWhitespace: false,
  includePunctuation: false
});

const getWordsWithIndices = <T>(chars: Word<T>, extract: (char: T) => string, options?: WordOptions): WordsWithIndices<T> => {
  options = {
    ...getDefaultOptions(),
    ...options
  };
  const extractedChars: string[] = Arr.map(chars, extract);
  const characterMap: CharacterMap = classify(extractedChars);
  return findWordsWithIndices(chars, extractedChars, characterMap, options);
};

const getWords = <T>(chars: Word<T>, extract: (char: T) => string, options?: WordOptions): Word<T>[] =>
  getWordsWithIndices(chars, extract, options).words;

export {
  getWords,
  getWordsWithIndices
};
