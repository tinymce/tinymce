import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import SmartSelect from '../general/SmartSelect';

const universe = DomUniverse();

// The optimise parameter is no longer required in this API.
// Remove optimise as a code quality task: TBIO-4356
const word = function (element: Element, offset: number, optimise?: any) {
  return SmartSelect.word(universe, element, offset);
};

export default {
  word
};