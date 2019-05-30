import WordUtil from '../../util/WordUtil';
import Identify from '../../words/Identify';

var identify = function (allText) {
  return Identify.words(allText);
};

var isWord = function (_universe, text) {
  return !WordUtil.hasBreak(text);
};

export default <any> {
  identify: identify,
  isWord: isWord
};