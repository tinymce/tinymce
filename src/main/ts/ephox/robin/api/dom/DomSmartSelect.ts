import { DomUniverse } from '@ephox/boss';
import SmartSelect from '../general/SmartSelect';

var universe = DomUniverse();

var word = function (element, offset, optimise) {
  return SmartSelect.word(universe, element, offset, optimise);
};

export default <any> {
  word: word
};