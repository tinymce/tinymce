import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import * as Pathway from '../general/Pathway';

const universe = DomUniverse();

const simplify = function (elements: Element[]) {
  return Pathway.simplify(universe, elements);
};

export {
  simplify
};
