import { Arr, Fun } from '@ephox/katamari';

type TableResizer = (delta: number) => void;

export interface ResizeBehaviour {
  readonly resizeTable: (resizer: TableResizer, delta: number, isLastColumn: boolean) => void;
  readonly calcLeftEdgeDeltas: (input: number[], index: number, nextIndex: number, delta: number, minCellSize: number, relativeSizing: boolean) => number[];
  readonly calcMiddleDeltas: (input: number[], previousIndex: number, index: number, nextIndex: number, delta: number, minCellSize: number, relativeSizing: boolean) => number[];
  readonly calcRightEdgeDeltas: (input: number[], previousIndex: number, index: number, delta: number, minCellSize: number, relativeSizing: boolean) => number[];
}

const zero = (array: number[]) => Arr.map(array, Fun.constant(0));

const surround = (input: number[], startIndex: number, endIndex: number, results: number[], f: (array: number[]) => number[]) =>
  f(input.slice(0, startIndex)).concat(results).concat(f(input.slice(endIndex)));


// Preserve the size of the columns/rows and adjust the table size
const resizeTable = (): ResizeBehaviour => {
  const calcFixedDeltas = (input: number[], index: number, next: number, delta: number, minCellSize: number) => {
    if (delta >= 0) {
      return surround(input, index, next + 1, [ delta, 0 ], zero);
    } else {
      const newThis = Math.max(minCellSize, input[index] + delta);
      const diff = input[index] - newThis;
      return surround(input, index, next + 1, [ -diff, 0 ], zero);
    }
  };

  const calcRelativeDeltas = (input: number[], index: number, delta: number, minCellSize: number) => {
    // ASSUMPTION: The delta will be a percentage. This may not be correct if other relative sizing is added, so we probably
    // need a better way to calc the ratio.
    const ratio = (100 + delta) / 100;
    const newThis = Math.max(minCellSize, (input[index] + delta) / ratio);
    return Arr.map(input, (size, idx) => {
      const newSize = idx === index ? newThis : size / ratio;
      return newSize - size;
    });
  };

  const calcLeftEdgeDeltas = (input: number[], index: number, next: number, delta: number, minCellSize: number, relativeSizing: boolean) => {
    if (relativeSizing) {
      return calcRelativeDeltas(input, index, delta, minCellSize);
    } else {
      return calcFixedDeltas(input, index, next, delta, minCellSize);
    }
  };

  const calcMiddleDeltas = (input: number[], prev: number, index: number, next: number, delta: number, minCellSize: number, relativeSizing: boolean) =>
    calcLeftEdgeDeltas(input, index, next, delta, minCellSize, relativeSizing);

  const resizeTable = (resizer: TableResizer, delta: number) =>
    resizer(delta);

  const calcRightEdgeDeltas = (input: number[], _prev: number, index: number, delta: number, minCellSize: number, relativeSizing: boolean) => {
    if (relativeSizing) {
      return calcRelativeDeltas(input, index, delta, minCellSize);
    } else {
      if (delta >= 0) {
        return zero(input.slice(0, index)).concat([ delta ]);
      } else {
        const size = Math.max(minCellSize, input[index] + delta);
        return zero(input.slice(0, index)).concat([ size - input[index] ]);
      }
    }
  };

  return {
    resizeTable,
    calcLeftEdgeDeltas,
    calcMiddleDeltas,
    calcRightEdgeDeltas
  };
};

// Distribute the column/rows and try to preserve the table size
const preserveTable = (): ResizeBehaviour => {
  const calcLeftEdgeDeltas = (input: number[], index: number, next: number, delta: number, minCellSize: number) => {
    if (delta >= 0) {
      const newNext = Math.max(minCellSize, input[next] - delta);
      const diff = newNext - input[next];
      return surround(input, index, next + 1, [ Math.abs(diff), diff ], zero);
    } else {
      const newThis = Math.max(minCellSize, input[index] + delta);
      const diff = input[index] - newThis;
      return surround(input, index, next + 1, [ newThis - input[index], diff ], zero);
    }
  };

  const calcMiddleDeltas = (input: number[], prev: number, index: number, next: number, delta: number, minCellSize: number) =>
    calcLeftEdgeDeltas(input, index, next, delta, minCellSize);

  const resizeTable = (resizer: TableResizer, delta: number, isLastColumn: boolean) => {
    if (isLastColumn) {
      resizer(delta);
    }
  };

  const calcRightEdgeDeltas = (input: number[], _prev: number, index: number, delta: number, minCellSize: number, relativeSizing: boolean) => {
    if (relativeSizing) {
      return zero(input);
    } else {
      const diff = delta / input.length;
      return Arr.map(input, Fun.constant(diff));
    }
  };

  return {
    resizeTable,
    calcLeftEdgeDeltas,
    calcMiddleDeltas,
    calcRightEdgeDeltas
  };
};

export {
  resizeTable,
  preserveTable
};
