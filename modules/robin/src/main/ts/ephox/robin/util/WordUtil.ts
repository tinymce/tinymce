import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Pattern } from '@ephox/polaris';
import { Search } from '@ephox/polaris';

var wordstart = new RegExp(Pattern.wordbreak() + '+', 'g');

var zero = Fun.constant(0);

/**
 * Returns optional text after the last word break character
 */
var lastWord = function (text) {
  return leftBreak(text).map(function (index) {
    return text.substring(index);
  });
};

/**
 * Returns optional text up to the first word break character
 */
var firstWord = function (text) {
  return rightBreak(text).map(function (index) {
    return text.substring(0, index + 1);
  });
};

/*
 * Returns the index position of a break when going left (i.e. last word break)
 */
var leftBreak = function (text) {
  var indices = Search.findall(text, Pattern.custom(Pattern.wordbreak(), zero, zero, Option.none()));
  return Option.from(indices[indices.length - 1]).map(function (match) {
    return match.start();
  });
};

/*
 * Returns the index position of a break when going right (i.e. first word break)
 */
var rightBreak = function (text) {
  // ASSUMPTION: search is sufficient because we only need to find the first one.
  var index = text.search(wordstart);
  return index > -1 ? Option.some(index) : Option.none();
};

var hasBreak = function (text) {
  return rightBreak(text).isSome();
};

export default <any> {
  firstWord: firstWord,
  lastWord: lastWord,
  leftBreak: leftBreak,
  rightBreak: rightBreak,
  hasBreak: hasBreak
};