import { Arr } from '@ephox/katamari';
import Query from './Query';
import Translate from './Translate';

/**
 * After subdivide has split the unit, update the resulting PositionArray based on the unit start position.
 */
var divide = function (unit, positions, subdivide) {
  var mini = subdivide(unit, positions);
  return Translate.translate(mini, unit.start());
};

/**
 * Adds extra split points into a PositionArray, using subdivide to split if necessary
 */
var splits = function (parray, positions, subdivide) {
  if (positions.length === 0) return parray;

  return Arr.bind(parray, function (unit) {
    var relevant = Arr.bind(positions, function (pos) {
      return Query.inUnit(unit, pos) ? [ pos - unit.start() ] : [];
    });

    return relevant.length > 0 ? divide(unit, relevant, subdivide) : [ unit ];
  });
};

export default <any> {
  splits: splits
};