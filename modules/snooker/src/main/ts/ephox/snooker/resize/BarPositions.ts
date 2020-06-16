import { Arr, Fun, Option } from '@ephox/katamari';
import { Element, Height, Location, Width } from '@ephox/sugar';

export interface RowInfo {
  readonly row: number;
  readonly y: number;
}

export interface ColInfo {
  readonly col: number;
  readonly x: number;
}

export interface BarPositions<T> {
  readonly delta: (delta: number, table: Element) => number;
  readonly edge: (e: Element) => number;
  readonly positions: (array: Option<Element>[], table: Element) => Option<T>[];
}

const rowInfo = (row: number, y: number): RowInfo => ({
  row,
  y
});

const colInfo = (col: number, x: number): ColInfo => ({
  col,
  x
});

const rtlEdge = function (cell: Element) {
  const pos = Location.absolute(cell);
  return pos.left() + Width.getOuter(cell);
};

const ltrEdge = function (cell: Element) {
  return Location.absolute(cell).left();
};

const getLeftEdge = function (index: number, cell: Element) {
  return colInfo(index, ltrEdge(cell));
};

const getRightEdge = function (index: number, cell: Element) {
  return colInfo(index, rtlEdge(cell));
};

const getTop = function (cell: Element) {
  return Location.absolute(cell).top();
};

const getTopEdge = function (index: number, cell: Element) {
  return rowInfo(index, getTop(cell));
};

const getBottomEdge = function (index: number, cell: Element) {
  return rowInfo(index, getTop(cell) + Height.getOuter(cell));
};

const findPositions = function <T> (getInnerEdge: (idx: number, ele: Element) => T, getOuterEdge: (idx: number, ele: Element) => T, array: Option<Element>[]) {
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
  positions: (optElements: Option<Element>[]) => findPositions(getTopEdge, getBottomEdge, optElements),
  edge: getTop
};

const ltr: BarPositions<ColInfo> = {
  delta: Fun.identity,
  edge: ltrEdge,
  positions: (optElements: Option<Element>[]) => findPositions(getLeftEdge, getRightEdge, optElements)
};

const rtl: BarPositions<ColInfo> = {
  delta: negate,
  edge: rtlEdge,
  positions: (optElements: Option<Element>[]) => findPositions(getRightEdge, getLeftEdge, optElements)
};

export {
  height,
  rtl,
  ltr
};
