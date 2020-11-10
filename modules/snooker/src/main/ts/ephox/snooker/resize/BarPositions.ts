import { Arr, Fun, Optional } from '@ephox/katamari';
import { Direction, Height, SugarElement, SugarLocation, Width } from '@ephox/sugar';

export interface RowInfo {
  readonly row: number;
  readonly y: number;
  readonly cell: SugarElement<HTMLTableCellElement>;
}

export interface ColInfo {
  readonly col: number;
  readonly x: number;
  readonly cell: SugarElement;
}

export interface BarPositions<T> {
  readonly delta: (delta: number, table: SugarElement) => number;
  readonly edge: (e: SugarElement) => number;
  readonly positions: (array: Optional<SugarElement>[], table: SugarElement) => Optional<T>[];
}

const rowInfo = (row: number, y: number, cell: SugarElement): RowInfo => ({
  row,
  y,
  cell
});

const colInfo = (col: number, x: number, cell: SugarElement): ColInfo => ({
  col,
  x,
  cell
});

const rtlEdge = function (cell: SugarElement) {
  const pos = SugarLocation.absolute(cell);
  return pos.left + Width.getOuter(cell);
};

const ltrEdge = function (cell: SugarElement) {
  return SugarLocation.absolute(cell).left;
};

const getLeftEdge = function (index: number, cell: SugarElement) {
  return colInfo(index, ltrEdge(cell), cell);
};

const getRightEdge = function (index: number, cell: SugarElement) {
  return colInfo(index, rtlEdge(cell), cell);
};

const getTop = function (cell: SugarElement) {
  return SugarLocation.absolute(cell).top;
};

const getTopEdge = function (index: number, cell: SugarElement) {
  return rowInfo(index, getTop(cell), cell);
};

const getBottomEdge = function (index: number, cell: SugarElement) {
  return rowInfo(index, getTop(cell) + Height.getOuter(cell), cell);
};

const findPositions = function <T> (getInnerEdge: (idx: number, ele: SugarElement) => T, getOuterEdge: (idx: number, ele: SugarElement) => T, array: Optional<SugarElement>[]) {
  if (array.length === 0 ) { return []; }
  const lines = Arr.map(array.slice(1), function (cellOption, index) {
    return cellOption.map(function (cell) {
      return getInnerEdge(index, cell);
    });
  });

  const lastLine = array[array.length - 1].map(function (cell) {
    return getOuterEdge(array.length - 1, cell);
  });

  return lines.concat([ lastLine ]);
};

const negate = function (step: number) {
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

