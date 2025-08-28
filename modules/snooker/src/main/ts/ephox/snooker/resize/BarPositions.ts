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
  readonly delta: (delta: number, table: SugarElement<HTMLTableElement>) => number;
  readonly edge: (e: SugarElement<HTMLElement>) => number;
  readonly positions: (array: Optional<SugarElement<HTMLTableCellElement>>[], table: SugarElement<HTMLTableElement>) => Optional<T>[];
}

const rowInfo = (row: number, y: number): RowInfo => ({
  row,
  y
});

const colInfo = (col: number, x: number): ColInfo => ({
  col,
  x
});

const rtlEdge = (cell: SugarElement<HTMLElement>): number => {
  const pos = SugarLocation.absolute(cell);
  return pos.left + Width.getOuter(cell);
};

const ltrEdge = (cell: SugarElement<HTMLElement>): number => {
  return SugarLocation.absolute(cell).left;
};

const getLeftEdge = (index: number, cell: SugarElement<HTMLTableCellElement>): ColInfo => {
  return colInfo(index, ltrEdge(cell));
};

const getRightEdge = (index: number, cell: SugarElement<HTMLTableCellElement>): ColInfo => {
  return colInfo(index, rtlEdge(cell));
};

const getTop = (cell: SugarElement<HTMLElement>): number => {
  return SugarLocation.absolute(cell).top;
};

const getTopEdge = (index: number, cell: SugarElement<HTMLTableCellElement>): RowInfo => {
  return rowInfo(index, getTop(cell));
};

const getBottomEdge = (index: number, cell: SugarElement<HTMLTableCellElement>): RowInfo => {
  return rowInfo(index, getTop(cell) + Height.getOuter(cell));
};

const findPositions = <T> (
  getInnerEdge: (idx: number, ele: SugarElement<HTMLTableCellElement>) => T,
  getOuterEdge: (idx: number, ele: SugarElement<HTMLTableCellElement>) => T,
  array: Optional<SugarElement<HTMLTableCellElement>>[]
): Optional<T>[] => {
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
  positions: (optElements) => findPositions(getTopEdge, getBottomEdge, optElements),
  edge: getTop
};

const ltr: BarPositions<ColInfo> = {
  delta: Fun.identity,
  edge: ltrEdge,
  positions: (optElements) => findPositions(getLeftEdge, getRightEdge, optElements)
};

const rtl: BarPositions<ColInfo> = {
  delta: negate,
  edge: rtlEdge,
  positions: (optElements) => findPositions(getRightEdge, getLeftEdge, optElements)
};

const detect = Direction.onDirection(ltr, rtl);

const width: BarPositions<ColInfo> = {
  delta: (amount: number, table: SugarElement<HTMLTableElement>) => detect(table).delta(amount, table),
  positions: (cols: Optional<SugarElement<HTMLTableCellElement>>[], table: SugarElement<HTMLTableElement>) => detect(table).positions(cols, table),
  edge: (cell: SugarElement<HTMLElement>) => detect(cell).edge(cell)
};

export { height, width, rtl, ltr };

