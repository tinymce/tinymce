import { DomUniverse } from '@ephox/boss';
import Clumps from '../general/Clumps';

var universe = DomUniverse();

/* See general.Clumps for explanation. */
var fractures = function (isRoot, start, soffset, finish, foffset, ceiling) {
  return Clumps.fractures(universe, isRoot, start, soffset, finish, foffset, ceiling);
};

var fracture = function (isRoot, start, soffset, finish, foffset, ceiling) {
  return Clumps.fracture(universe, isRoot, start, soffset, finish, foffset, ceiling);
};

export default <any> {
  fractures: fractures,
  fracture: fracture
};