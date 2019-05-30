import { Arr } from '@ephox/katamari';
import * as Query from './Query';
import * as Translate from './Translate';
import { PRange } from '../pattern/Types';

/**
 * After subdivide has split the unit, update the resulting PositionArray based on the unit start position.
 */
const divide = function <T extends PRange> (unit: T, positions: number[], subdivide: (unit: T, positions: number[]) => T[]) {
  const mini = subdivide(unit, positions);
  return Translate.translate(mini, unit.start());
};

/**
 * Adds extra split points into a PositionArray, using subdivide to split if necessary
 */
const splits = function <T extends PRange> (parray: T[], positions: number[], subdivide: (unit: T, positions: number[]) => T[]) {
  if (positions.length === 0) { return parray; }

  return Arr.bind(parray, function (unit) {
    const relevant = Arr.bind(positions, function (pos) {
      return Query.inUnit(unit, pos) ? [ pos - unit.start() ] : [];
    });

    return relevant.length > 0 ? divide(unit, relevant, subdivide) : [ unit ];
  });
};

export {
  splits
};