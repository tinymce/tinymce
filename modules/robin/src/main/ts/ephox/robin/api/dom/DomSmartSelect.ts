import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import * as SmartSelect from '../general/SmartSelect';

const universe = DomUniverse();

// The optimise parameter is no longer required in this API.
// Remove optimise as a code quality task: TBIO-4356
const word = function (element: Element, offset: number, _optimise?: any) {
  return SmartSelect.word(universe, element, offset);
};

export {
  word
};
