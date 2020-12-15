import { Arr, Fun, Optional } from '@ephox/katamari';
import { Direction, Height, SugarElement, SugarLocation, Width } from '@ephox/sugar';

export interface RowInfo {
  readonly row: number;
  readonly y: number;
}

export interface ColInfo {
  readonly col: number;
  readonly x: number;
}

export interface BarPositions<T> {
  readonly delta: (delta: number, table: SugarElement) => number;
  readonly edge: (e: SugarElement) => number;
  readonly positions: (array: Optional<SugarElement>[], table: SugarElement) => Optional<T>[];
}

const rowInfo = (row: number, y: number): RowInfo => ({
  row,
  y
});

const colInfo = (col: number, x: number): ColInfo => ({
  col,
  x
});

const rtlEdge = (cell: SugarElement): number => {
  const pos = SugarLocation.absolute(cell);
  return pos.left + Width.getOuter(cell);
};

const ltrEdge = (cell: SugarElement): number => {
  return SugarLocation.absolute(cell).left;
};

const getLeftEdge = (index: number, cell: SugarElement): ColInfo => {
  return colInfo(index, ltrEdge(cell));
};

const getRightEdge = (index: number, cell: SugarElement): ColInfo => {
  return colInfo(index, rtlEdge(cell));
};

const getTop = (cell: SugarElement): number => {
  return SugarLocation.absolute(cell).top;
};

const getTopEdge = (index: number, cell: SugarElement): RowInfo => {
  return rowInfo(index, getTop(cell));
};

const getBottomEdge = (index: number, cell: SugarElement): RowInfo => {
  return rowInfo(index, getTop(cell) + Height.getOuter(cell));
};

const findPositions = <T> (getInnerEdge: (idx: number, ele: SugarElement) => T, getOuterEdge: (idx: number, ele: SugarElement) => T, array: Optional<SugarElement>[]): Optional<T>[] => {
  if (array.length === 0 ) {
    return [];
  }
  const lines = Arr.map(array.slice(1), (cellOption, index) => {
    return cellOption.map((cell) => {
      return getInnerEdge(index, cell);
    });
  });

  const lastLine = array[array.length - 1].map((cell) => {
    return getOuterEdge(array.length - 1, cell);
  });

  return lines.concat([ lastLine ]);
};

const negate = (step: number): number => {
  return -step;
};

const height: BarPositions<RowInfo> = {
  delta: Fun.identity,
  positions: (optElements: Optional<SugarElement>[]) => findPositions(getTopEdge, getBottomEdge, optElements),
  edge: getTop
};

const ltr: BarPositions<ColInfo> = {
  delta: Fun.identity,
  edge: ltrEdge,
  positions: (optElements: Optional<SugarElement>[]) => findPositions(getLeftEdge, getRightEdge, optElements)
};

const rtl: BarPositions<ColInfo> = {
  delta: negate,
  edge: rtlEdge,
  positions: (optElements: Optional<SugarElement>[]) => findPositions(getRightEdge, getLeftEdge, optElements)
};

const detect = Direction.onDirection(ltr, rtl);

const width: BarPositions<ColInfo> = {
  delta: (amount: number, table: SugarElement) => detect(table).delta(amount, table),
  positions: (cols: Optional<SugarElement>[], table: SugarElement) => detect(table).positions(cols, table),
  edge: (cell: SugarElement) => detect(cell).edge(cell)
};

export { height, width, rtl, ltr };

