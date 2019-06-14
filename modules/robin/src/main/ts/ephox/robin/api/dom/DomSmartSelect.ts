import { DomUniverse } from '@ephox/boss';
import SmartSelect from '../general/SmartSelect';
import { Element } from '@ephox/sugar';

const universe = DomUniverse();

// The optimise parameter is no longer required in this API.
// Remove optimise as a code quality task: TBIO-4356
const word = function (element: Element, offset: number, optimise?: any) {
  return SmartSelect.word(universe, element, offset);
};

export default {
  word
};