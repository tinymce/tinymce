/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import UnicodeData from './UnicodeData';
import StringMapper from './StringMapper';
import WordBoundary from './WordBoundary';

const EMPTY_STRING = UnicodeData.EMPTY_STRING;
const WHITESPACE = UnicodeData.WHITESPACE;
const PUNCTUATION = UnicodeData.PUNCTUATION;

const isProtocol = function (word) {
  return word === 'http' || word === 'https';
};

const findWordEnd = function (str, index) {
  let i;
  for (i = index; i < str.length; ++i) {
    const chr = str.charAt(i);

    if (WHITESPACE.test(chr)) {
      break;
    }
  }
  return i;
};

const extractUrl = function (word, str, index) {
  const endIndex = findWordEnd(str, index + 1);
  const peakedWord = str.substring(index + 1, endIndex);
  if (peakedWord.substr(0, 3) === '://') {
    return {
      word: word + peakedWord,
      index: endIndex
    };
  }

  return {
    word,
    index
  };
};

const doGetWords = function (str, options) {
  let i = 0;
  const map = StringMapper.classify(str);
  const len = map.length;
  let word: any = [];
  const words = [];
  let chr;
  let includePunctuation;
  let includeWhitespace;

  if (!options) {
    options = {};
  }

  if (options.ignoreCase) {
    str = str.toLowerCase();
  }

  includePunctuation = options.includePunctuation;
  includeWhitespace = options.includeWhitespace;

  // Loop through each character in the classification map and determine
  // whether it precedes a word boundary, building an array of distinct
  // words as we go.
  for (; i < len; ++i) {
    chr = str.charAt(i);

    // Append this character to the current word.
    word.push(chr);

    // If there's a word boundary between the current character and the
    // next character, append the current word to the words array and
    // start building a new word.
    if (WordBoundary.isWordBoundary(map, i)) {
      word = word.join(EMPTY_STRING);

      if (word &&
        (includeWhitespace || !WHITESPACE.test(word)) &&
        (includePunctuation || !PUNCTUATION.test(word))) {
        if (isProtocol(word)) {
          const obj = extractUrl(word, str, i);
          words.push(obj.word);
          i = obj.index;
        } else {
          words.push(word);
        }
      }

      word = [];
    }
  }

  return words;
};

const getWords = function (str, options?) {
  return doGetWords(str.replace(/\ufeff/g, ''), options);
};

export default {
  getWords
};