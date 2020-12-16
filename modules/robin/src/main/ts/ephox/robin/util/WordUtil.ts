import { Fun, Optional } from '@ephox/katamari';
import { Pattern, Search } from '@ephox/polaris';

const wordstart = new RegExp(Pattern.wordbreak() + '+', 'g');

const zero = Fun.constant(0);

/**
 * Returns optional text after the last word break character
 */
const lastWord = (text: string): Optional<string> => {
  return leftBreak(text).map((index) => {
    return text.substring(index);
  });
};

/**
 * Returns optional text up to the first word break character
 */
const firstWord = (text: string): Optional<string> => {
  return rightBreak(text).map((index) => {
    return text.substring(0, index + 1);
  });
};

/*
 * Returns the index position of a break when going left (i.e. last word break)
 */
const leftBreak = (text: string): Optional<number> => {
  const indices = Search.findall(text, Pattern.custom(Pattern.wordbreak(), zero, zero, Optional.none()));
  return Optional.from(indices[indices.length - 1]).map((match) => {
    return match.start;
  });
};

/*
 * Returns the index position of a break when going right (i.e. first word break)
 */
const rightBreak = (text: string): Optional<number> => {
  // ASSUMPTION: search is sufficient because we only need to find the first one.
  const index = text.search(wordstart);
  return index > -1 ? Optional.some(index) : Optional.none<number>();
};

const hasBreak = (text: string): boolean => {
  return rightBreak(text).isSome();
};

export {
  firstWord,
  lastWord,
  leftBreak,
  rightBreak,
  hasBreak
};
