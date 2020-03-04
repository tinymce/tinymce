import { Fun, Option } from '@ephox/katamari';
import { Pattern, Search } from '@ephox/polaris';

const wordstart = new RegExp(Pattern.wordbreak() + '+', 'g');

const zero = Fun.constant(0);

/**
 * Returns optional text after the last word break character
 */
const lastWord = function (text: string) {
  return leftBreak(text).map(function (index) {
    return text.substring(index);
  });
};

/**
 * Returns optional text up to the first word break character
 */
const firstWord = function (text: string) {
  return rightBreak(text).map(function (index) {
    return text.substring(0, index + 1);
  });
};

/*
 * Returns the index position of a break when going left (i.e. last word break)
 */
const leftBreak = function (text: string) {
  const indices = Search.findall(text, Pattern.custom(Pattern.wordbreak(), zero, zero, Option.none()));
  return Option.from(indices[indices.length - 1]).map(function (match) {
    return match.start();
  });
};

/*
 * Returns the index position of a break when going right (i.e. first word break)
 */
const rightBreak = function (text: string) {
  // ASSUMPTION: search is sufficient because we only need to find the first one.
  const index = text.search(wordstart);
  return index > -1 ? Option.some(index) : Option.none<number>();
};

const hasBreak = function (text: string) {
  return rightBreak(text).isSome();
};

export {
  firstWord,
  lastWord,
  leftBreak,
  rightBreak,
  hasBreak
};
