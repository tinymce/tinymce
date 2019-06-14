import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import { Textdata } from '../general/Textdata';

const universe = DomUniverse();

const from = function (elements: Element[], current: Element, offset: number) {
  return Textdata.from(universe, elements, current, offset);
};

export default {
  from
};