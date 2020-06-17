import { Arr, Fun } from '@ephox/katamari';
import { TableSize } from '../api/TableSize';
import { ColumnContext } from './ColumnContext';
import { ColumnResizing } from '../api/TableResize';

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
const determine = function (input: number[], column: number, step: number, tableSize: TableSize, columnResizeBehaviour: ColumnResizing): number[] {
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
    // For all cases (ltr and rtl), excluding the 'resizetable' case, the sum of all of the deltas should total zero
    if (step >= 0) {
      const newNext = Math.max(tableSize.minCellWidth(), result[next] - step);
      const diffx = newNext - result[next];
      const newDeltas = columnResizeBehaviour === 'resizetable' ? [ step, 0 ] : [ Math.abs(diffx), diffx ];
      return zero(result.slice(0, index)).concat(newDeltas).concat(zero(result.slice(next + 1)));
    } else {
      const newThis = Math.max(tableSize.minCellWidth(), result[index] + step);
      const diffx = result[index] - newThis;
      const newDeltas = columnResizeBehaviour === 'resizetable' ? [ -diffx, 0 ] : [ newThis - result[index], diffx ];
      return zero(result.slice(0, index)).concat(newDeltas).concat(zero(result.slice(next + 1)));
    }
  };

  const onLeft = onChange;

  const onMiddle = function (_prev: number, index: number, next: number) {
    return onChange(index, next);
  };

  // Applies to the last column bar
  const onRight = function (_prev: number, index: number) {
    // 'default' means that the whole table and its columns need to be resized to maintain ratio
    if (columnResizeBehaviour === 'default') {
      // Ensure step is evenly distributed between all of the columns
      if (tableSize.label === 'fixed') {
        const width = Arr.foldl(result, (acc, num) => acc + num, 0);
        const multipler = (width + step) / width;
        return Arr.map(result, (val) => val * multipler - val);
      }
      // 'relative' widths (%) do not require the column widths to be changed
      return zero(result);
    }

    if (step >= 0) {
      return zero(result.slice(0, index)).concat([ step ]);
    } else {
      const size = Math.max(tableSize.minCellWidth(), result[index] + step);
      return zero(result.slice(0, index)).concat([ size - result[index] ]);
    }
  };

  return context.fold(onNone, onOnly, onLeft, onMiddle, onRight);
};

export {
  determine
};
