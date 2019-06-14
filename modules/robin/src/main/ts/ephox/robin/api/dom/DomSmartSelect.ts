import { DomUniverse } from '@ephox/boss';
import SmartSelect from '../general/SmartSelect';
import { Element } from '@ephox/sugar';

const universe = DomUniverse();

const word = function (element: Element, offset: number, optimise?: any) {
  return SmartSelect.word(universe, element, offset);
};

export default {
  word
};