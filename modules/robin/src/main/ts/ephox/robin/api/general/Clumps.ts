import { Universe } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import { Split } from '@ephox/phoenix';
import * as Clumps from '../../clumps/Clumps';
import * as EntryPoints from '../../clumps/EntryPoints';
import * as Fractures from '../../clumps/Fractures';

/*
 * clumping fracture: *fractures* method.
 *  - this breaks the full range specified by (start, soffset) -> (finish, foffset) into
 *    clumps based on boundary tags. Each clump (which will NOT HAVE block elements) is
 *    then fractured via *fracture* and the resulting list/array is returned.
 */
const same = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, start: E, soffset: number, foffset: number, ceiling?: (e: E) => E) {
  const middle = Split.splitByPair(universe, start, soffset, foffset);
  return Fractures.fracture(universe, isRoot, middle, middle, ceiling);
};

const diff = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, start: E, soffset: number, finish: E, foffset: number, ceiling?: (e: E) => E) {
  const rightSide = EntryPoints.toRight(universe, isRoot, finish, foffset);
  const leftSide = EntryPoints.toLeft(universe, isRoot, start, soffset);
  return Fractures.fracture(universe, isRoot, leftSide, rightSide, ceiling);
};

/* inline fracture: *fracture* method.
 *  - this identifies the slice of child nodes from a common ancestor that defines the
 *    clump boundary: (start, soffset) -> (finish, foffset). It assumes that it is
 *    a *true* clump (i.e. contains NO block elements), so all of the children
 *    identified can be wrapped by an INLINE tag. Note, clumps are identified via the
 *    *Clumps.collect* method.
 *
 *    This may not need to be exposed, and is currently exposed just for testing.
 */
const fracture = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, start: E, soffset: number, finish: E, foffset: number, ceiling?: (e: E) => E) {
  const sameText = universe.property().isText(start) && universe.eq(start, finish);
  return sameText ? same(universe, isRoot, start, soffset, foffset, ceiling) : diff(universe, isRoot, start, soffset, finish, foffset, ceiling);
};

const fractures = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, start: E, soffset: number, finish: E, foffset: number, ceiling?: (e: E) => E) {
  const clumps = Clumps.collect(universe, isRoot, start, soffset, finish, foffset);
  return Arr.bind(clumps, function (clump) {
    return fracture(universe, isRoot, clump.start, clump.soffset, clump.finish, clump.foffset, ceiling).toArray();
  });
};

export {
  fractures,
  fracture
};
