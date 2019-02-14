import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import * as Injection from '../general/Injection';

const universe = DomUniverse();

const atStartOf = function (element: Element, offset: number, injection: Element) {
  Injection.atStartOf(universe, element, offset, injection);
};

export {
  atStartOf
};