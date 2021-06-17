import { Arr, Fun } from '@ephox/katamari';

import { ResizeBehaviour } from '../api/ResizeBehaviour';
import { TableSize } from '../api/TableSize';
import { ColumnContext } from './ColumnContext';

/*
 * Based on the column index, identify the context
 */
const neighbours = (input: number[], index: number) => {
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
 * based on a resize at column: column of step: step
 */
const determine = (input: number[], column: number, step: number, tableSize: TableSize, resize: ResizeBehaviour): number[] => {
  const result = input.slice(0);
  const context = neighbours(input, column);

  const onNone = Fun.constant(Arr.map(result, Fun.constant(0)));
  const onOnly = (index: number) => tableSize.singleColumnWidth(result[index], step);

  const onLeft = (index: number, next: number) =>
    resize.calcLeftEdgeDeltas(result, index, next, step, tableSize.minCellWidth(), tableSize.isRelative);

  const onMiddle = (prev: number, index: number, next: number) =>
    resize.calcMiddleDeltas(result, prev, index, next, step, tableSize.minCellWidth(), tableSize.isRelative);

  // Applies to the last column bar
  const onRight = (prev: number, index: number) =>
    resize.calcRightEdgeDeltas(result, prev, index, step, tableSize.minCellWidth(), tableSize.isRelative);

  return context.fold(onNone, onOnly, onLeft, onMiddle, onRight);
};

export {
  determine
};
