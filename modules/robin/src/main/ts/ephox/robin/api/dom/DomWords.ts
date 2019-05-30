import { DomUniverse } from '@ephox/boss';
import Words from '../general/Words';

var universe = DomUniverse();

var identify = function (allText) {
  return Words.identify(allText);
};

var isWord = function (text) {
  return Words.isWord(universe, text);
};

export default <any> {
  identify: identify,
  isWord: isWord
};