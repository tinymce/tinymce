import { DomUniverse } from '@ephox/boss';
import { Textdata } from '../general/Textdata';
import { Element } from '@ephox/sugar';

const universe = DomUniverse();

const from = function (elements: Element[], current: Element, offset: number) {
  return Textdata.from(universe, elements, current, offset);
};

export default {
  from
};