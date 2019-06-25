import { Arr, Fun } from '@ephox/katamari';
import { ColumnContext } from './ColumnContext';
import { TableSize } from '../resize/Types';

/*
 * Based on the column index, identify the context
 */
const neighbours = function (input: number[], index: number) {
  if (input.length === 0) {
    return ColumnContext.none();
  }
  if (input.length === 1) {
    return ColumnContext.only(0);
  }
  if (index === 0) {
    return ColumnContext.left(0, 1);
  }
  if (index === input.length - 1) {
    return ColumnContext.right(index - 1, index);
  }
  if (index > 0 && index < input.length - 1) {
    return ColumnContext.middle(index - 1, index, index + 1);
  }
  return ColumnContext.none();
};

/*
 * Calculate the offsets to apply to each column width (not the absolute widths themselves)
 * based on a resize at column: column of step: step. The minimum column width allowed is min
 */
const determine = function (input: number[], column: number, step: number, tableSize: TableSize) {
  const result = input.slice(0);
  const context = neighbours(input, column);

  const zero = function (array: number[]) {
    return Arr.map(array, Fun.constant(0));
  };

  const onNone = Fun.constant(zero(result));
  const onOnly = function (index: number) {
    return tableSize.singleColumnWidth(result[index], step);
  };

  const onChange = function (index: number, next: number) {
    if (step >= 0) {
      const newNext = Math.max(tableSize.minCellWidth(), result[next] - step);
      return zero(result.slice(0, index)).concat([ step, newNext - result[next] ]).concat(zero(result.slice(next + 1)));
    } else {
      const newThis = Math.max(tableSize.minCellWidth(), result[index] + step);
      const diffx = result[index] - newThis;
      return zero(result.slice(0, index)).concat([ newThis - result[index], diffx ]).concat(zero(result.slice(next + 1)));
    }
  };

  const onLeft = onChange;

  const onMiddle = function (_prev: number, index: number, next: number) {
    return onChange(index, next);
  };

  const onRight = function (_prev: number, index: number) {
    if (step >= 0) {
      return zero(result.slice(0, index)).concat([ step ]);
    } else {
      const size = Math.max(tableSize.minCellWidth(), result[index] + step);
      return zero(result.slice(0, index)).concat([ size - result[index] ]);
    }
  };

  return context.fold(onNone, onOnly, onLeft, onMiddle, onRight);
};

export default {
  determine
};