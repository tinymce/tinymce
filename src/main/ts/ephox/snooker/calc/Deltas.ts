import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import ColumnContext from './ColumnContext';

/*
 * Based on the column index, identify the context
 */
var neighbours = function (input, index) {
  if (input.length === 0) return ColumnContext.none();
  if (input.length === 1) return ColumnContext.only(0);
  if (index === 0) return ColumnContext.left(0, 1);
  if (index === input.length - 1) return ColumnContext.right(index - 1, index);
  if (index > 0 && index < input.length - 1) return ColumnContext.middle(index - 1, index, index + 1);
  return ColumnContext.none();
};

/*
 * Calculate the offsets to apply to each column width (not the absolute widths themselves)
 * based on a resize at column: column of step: step. The minimum column width allowed is min
 */
var determine = function (input, column, step, tableSize) {
  var result = input.slice(0);
  var context = neighbours(input, column);

  var zero = function (array) {
    return Arr.map(array, Fun.constant(0));
  };

  var onNone = Fun.constant(zero(result));
  var onOnly = function (index) {
    return tableSize.singleColumnWidth(result[index], step);
  };

  var onChange = function (index, next) {
    if (step >= 0) {
      var newNext = Math.max(tableSize.minCellWidth(), result[next] - step);
      return zero(result.slice(0, index)).concat([ step, newNext-result[next] ]).concat(zero(result.slice(next + 1)));
    } else {
      var newThis = Math.max(tableSize.minCellWidth(), result[index] + step);
      var diffx = result[index] - newThis;
      return zero(result.slice(0, index)).concat([ newThis - result[index], diffx ]).concat(zero(result.slice(next + 1)));
    }
  };

  var onLeft = onChange;

  var onMiddle = function (prev, index, next) {
    return onChange(index, next);
  };

  var onRight = function (prev, index) {
    if (step >= 0) {
      return zero(result.slice(0, index)).concat([ step ]);
    } else {
      var size = Math.max(tableSize.minCellWidth(), result[index] + step);
      return zero(result.slice(0, index)).concat([ size - result[index] ]);
    }
  };

  return context.fold(onNone, onOnly, onLeft, onMiddle, onRight);
};

export default {
  determine: determine
};