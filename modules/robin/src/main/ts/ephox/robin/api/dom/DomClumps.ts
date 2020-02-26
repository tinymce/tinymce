import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import * as Clumps from '../general/Clumps';

const universe = DomUniverse();

/* See general.Clumps for explanation. */
const fractures = function (isRoot: (e: Element) => boolean, start: Element, soffset: number, finish: Element, foffset: number, ceiling?: (e: Element) => Element) {
  return Clumps.fractures(universe, isRoot, start, soffset, finish, foffset, ceiling);
};

const fracture = function (isRoot: (e: Element) => boolean, start: Element, soffset: number, finish: Element, foffset: number, ceiling?: (e: Element) => Element) {
  return Clumps.fracture(universe, isRoot, start, soffset, finish, foffset, ceiling);
};

export {
  fractures,
  fracture
};
