import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';
import * as Clumps from '../general/Clumps';

const universe = DomUniverse();

/* See general.Clumps for explanation. */
const fractures = function (isRoot: (e: SugarElement) => boolean, start: SugarElement, soffset: number, finish: SugarElement, foffset: number, ceiling?: (e: SugarElement) => SugarElement) {
  return Clumps.fractures(universe, isRoot, start, soffset, finish, foffset, ceiling);
};

const fracture = function (isRoot: (e: SugarElement) => boolean, start: SugarElement, soffset: number, finish: SugarElement, foffset: number, ceiling?: (e: SugarElement) => SugarElement) {
  return Clumps.fracture(universe, isRoot, start, soffset, finish, foffset, ceiling);
};

export {
  fractures,
  fracture
};
