import { Arr, Fun } from '@ephox/katamari';

type TableResizer = (delta: number) => void;

export interface ResizeBehaviour {
  readonly resizeTable: (resizer: TableResizer, delta: number, isLastColumn: boolean) => void;
  readonly clampTableDelta: (sizes: number[], index: number, delta: number, minCellSize: number, isLastColumn: boolean) => number;
  readonly calcLeftEdgeDeltas: (sizes: number[], index: number, nextIndex: number, delta: number, minCellSize: number, isRelative: boolean) => number[];
  readonly calcMiddleDeltas: (sizes: number[], previousIndex: number, index: number, nextIndex: number, delta: number, minCellSize: number, isRelative: boolean) => number[];
  readonly calcRightEdgeDeltas: (sizes: number[], previousIndex: number, index: number, delta: number, minCellSize: number, isRelative: boolean) => number[];
  readonly calcRedestributedWidths: (sizes: number[], total: number, pixelDelta: number, isRelative: boolean) => { delta: number; newSizes: number[] };
}

const zero = (array: number[]) => Arr.map(array, Fun.constant(0));

const surround = (sizes: number[], startIndex: number, endIndex: number, results: number[], f: (array: number[]) => number[]) =>
  f(sizes.slice(0, startIndex)).concat(results).concat(f(sizes.slice(endIndex)));

// Clamp positive or negative delta so that a column/row cannot be reduced past its min size
const clampDeltaHelper = (predicate: (delta: number) => boolean) => (sizes: number[], index: number, delta: number, minCellSize: number) => {
  if (!predicate(delta)) {
    return delta;
  } else {
    const newSize = Math.max(minCellSize, sizes[index] - Math.abs(delta));
    const diff = Math.abs(newSize - sizes[index]);
    return delta >= 0 ? diff : -diff;
  }
};

const clampNegativeDelta = clampDeltaHelper((delta) => delta < 0);
const clampDelta = clampDeltaHelper(Fun.always);

// Preserve the size of the columns/rows and adjust the table size
const resizeTable = (): ResizeBehaviour => {
  const calcFixedDeltas = (sizes: number[], index: number, next: number, delta: number, minCellSize: number) => {
    const clampedDelta = clampNegativeDelta(sizes, index, delta, minCellSize);
    return surround(sizes, index, next + 1, [ clampedDelta, 0 ], zero);
  };

  // Calculate delta for adjusted column
  // Also need to calculate deltas for all other columns/rows to ensure they stay at the same visual width/height
  // when the table width/height is adjusted
  const calcRelativeDeltas = (sizes: number[], index: number, delta: number, minCellSize: number) => {
    // ASSUMPTION: The delta will be a percentage. This may not be correct if other relative sizing is added, so we probably
    // need a better way to calc the ratio.
    const ratio = (100 + delta) / 100;
    const newThis = Math.max(minCellSize, (sizes[index] + delta) / ratio);
    return Arr.map(sizes, (size, idx) => {
      const newSize = idx === index ? newThis : size / ratio;
      return newSize - size;
    });
  };

  // Calculations for the inner columns/rows
  const calcLeftEdgeDeltas = (sizes: number[], index: number, next: number, delta: number, minCellSize: number, isRelative: boolean) => {
    if (isRelative) {
      return calcRelativeDeltas(sizes, index, delta, minCellSize);
    } else {
      return calcFixedDeltas(sizes, index, next, delta, minCellSize);
    }
  };

  const calcMiddleDeltas = (sizes: number[], _prev: number, index: number, next: number, delta: number, minCellSize: number, isRelative: boolean) =>
    calcLeftEdgeDeltas(sizes, index, next, delta, minCellSize, isRelative);

  const resizeTable = (resizer: TableResizer, delta: number) =>
    resizer(delta);

  // Calculations for the last column/row resizer
  const calcRightEdgeDeltas = (sizes: number[], _prev: number, index: number, delta: number, minCellSize: number, isRelative: boolean) => {
    if (isRelative) {
      return calcRelativeDeltas(sizes, index, delta, minCellSize);
    } else {
      const clampedDelta = clampNegativeDelta(sizes, index, delta, minCellSize);
      return zero(sizes.slice(0, index)).concat([ clampedDelta ]);
    }
  };

  const calcRedestributedWidths = (sizes: number[], totalWidth: number, pixelDelta: number, isRelative: boolean) => {
    if (isRelative) {
      const tableWidth = totalWidth + pixelDelta;
      const ratio = tableWidth / totalWidth;
      const newSizes = Arr.map(sizes, (size) => size / ratio);
      return {
        delta: (ratio * 100) - 100,
        newSizes,
      };
    } else {
      return {
        delta: pixelDelta,
        newSizes: sizes,
      };
    }
  };

  return {
    resizeTable,
    clampTableDelta: clampNegativeDelta,
    calcLeftEdgeDeltas,
    calcMiddleDeltas,
    calcRightEdgeDeltas,
    calcRedestributedWidths,
  };
};

// Distribute the column/rows and try to preserve the table size
const preserveTable = (): ResizeBehaviour => {
  // Calculations for the inner columns/rows
  const calcLeftEdgeDeltas = (sizes: number[], index: number, next: number, delta: number, minCellSize: number) => {
    const idx = delta >= 0 ? next : index;
    const clampedDelta = clampDelta(sizes, idx, delta, minCellSize);
    // negative delta -> deltas becomes [ neg, pos ], positive delta -> deltas becomes [ pos, neg ]
    return surround(sizes, index, next + 1, [ clampedDelta, -clampedDelta ], zero);
  };

  const calcMiddleDeltas = (sizes: number[], _prev: number, index: number, next: number, delta: number, minCellSize: number) =>
    calcLeftEdgeDeltas(sizes, index, next, delta, minCellSize);

  const resizeTable = (resizer: TableResizer, delta: number, isLastColumn: boolean) => {
    if (isLastColumn) {
      resizer(delta);
    }
  };

  // Calculations for the last column/row resizer
  const calcRightEdgeDeltas = (sizes: number[], _prev: number, _index: number, delta: number, _minCellSize: number, isRelative: boolean) => {
    if (isRelative) {
      return zero(sizes);
    } else {
      // Distribute the delta amongst all of the columns/rows
      const diff = delta / sizes.length;
      return Arr.map(sizes, Fun.constant(diff));
    }
  };

  const clampTableDelta = (sizes: number[], index: number, delta: number, minCellSize: number, isLastColumn: boolean) => {
    // Don't clamp the last resizer using normal methods
    // Need to allow table width to be reduced past the last column position to allow for distributive resizing
    if (isLastColumn) {
      if (delta >= 0) {
        return delta;
      } else {
        // Clamp delta so that none of the columns/rows can reduce below their min size
        const maxDelta = Arr.foldl(sizes, (a, b) => a + b - minCellSize, 0);
        return Math.max(-maxDelta, delta);
      }
    } else {
      return clampNegativeDelta(sizes, index, delta, minCellSize);
    }
  };

  const calcRedestributedWidths = (sizes: number[], _totalWidth: number, _pixelDelta: number, _isRelative: boolean) => ({
    delta: 0,
    newSizes: sizes,
  });

  return {
    resizeTable,
    clampTableDelta,
    calcLeftEdgeDeltas,
    calcMiddleDeltas,
    calcRightEdgeDeltas,
    calcRedestributedWidths
  };
};

export {
  resizeTable,
  preserveTable
};
