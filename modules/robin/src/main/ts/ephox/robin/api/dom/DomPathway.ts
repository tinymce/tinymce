import { DomUniverse } from '@ephox/boss';
import Pathway from '../general/Pathway';
import { Element } from '@ephox/sugar';

const universe = DomUniverse();

const simplify = function (elements: Element[]) {
  return Pathway.simplify(universe, elements);
};

export default {
  simplify
};