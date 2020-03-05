import { Fun } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

export interface Dimension {
  width: () => number;
  height: () => number;
}

export interface Dimensions {
  width: () => number[];
  height: () => number[];
}

export interface Grid {
  rows: () => number;
  columns: () => number;
}

export interface Address {
  row: () => number;
  column: () => number;
}

export interface Coords {
  x: () => number;
  y: () => number;
}

export interface Detail {
  element: () => Element;
  rowspan: () => number;
  colspan: () => number;
}

export interface DetailNew extends Detail {
  isNew: () => boolean;
}

export interface DetailExt extends Detail {
  row: () => number;
  column: () => number;
}

type Section = 'tfoot' | 'thead' | 'tbody';

export interface RowCells {
  cells: () => ElementNew[];
  section: () => Section;
}

export interface RowData<T> {
  element: () => Element;
  cells: () => T[];
  section: () => Section;
}

export interface RowDataNew<T> extends RowData<T> {
  isNew: () => boolean;
}

export interface ElementNew {
  element: () => Element;
  isNew: () => boolean;
}

export interface RowDetails {
  details: () => DetailNew[];
  section: () => Section;
}

export interface Bounds {
  startRow: () => number;
  startCol: () => number;
  finishRow: () => number;
  finishCol: () => number;
}

const dimension = (
  width: number,
  height: number
): Dimension => ({
  width: Fun.constant(width),
  height: Fun.constant(height)
});

const dimensions = (
  width: number[],
  height: number[]
): Dimensions => ({
  width: Fun.constant(width),
  height: Fun.constant(height)
});

const grid = (
  rows: number,
  columns: number
): Grid => ({
  rows: Fun.constant(rows),
  columns: Fun.constant(columns)
});

const address = (
  row: number,
  column: number
): Address => ({
  row: Fun.constant(row),
  column: Fun.constant(column)
});

const coords = (
  x: number,
  y: number
): Coords => ({
  x: Fun.constant(x),
  y: Fun.constant(y)
});

const detail = (
  element: Element,
  rowspan: number,
  colspan: number
): Detail => ({
  element: Fun.constant(element),
  rowspan: Fun.constant(rowspan),
  colspan: Fun.constant(colspan)
});

const detailnew = (
  element: Element,
  rowspan: number,
  colspan: number,
  isNew: boolean
): DetailNew => ({
  element: Fun.constant(element),
  rowspan: Fun.constant(rowspan),
  colspan: Fun.constant(colspan),
  isNew: Fun.constant(isNew)
});

const extended = (
  element: Element,
  rowspan: number,
  colspan: number,
  row: number,
  column: number
): DetailExt => ({
  element: Fun.constant(element),
  rowspan: Fun.constant(rowspan),
  colspan: Fun.constant(colspan),
  row: Fun.constant(row),
  column: Fun.constant(column)
});

const rowdata = <T> (
  element: Element,
  cells: T[],
  section: Section
): RowData<T> => ({
  element: Fun.constant(element),
  cells: Fun.constant(cells),
  section: Fun.constant(section)
});

const elementnew = (
  element: Element,
  isNew: boolean
): ElementNew => ({
  element: Fun.constant(element),
  isNew: Fun.constant(isNew)
});

const rowdatanew = <T> (
  element: Element,
  cells: T[],
  section: Section,
  isNew: boolean
): RowDataNew<T> => ({
  element: Fun.constant(element),
  cells: Fun.constant(cells),
  section: Fun.constant(section),
  isNew: Fun.constant(isNew)
});

const rowcells = (
  cells: ElementNew[],
  section: Section
): RowCells => ({
  cells: Fun.constant(cells),
  section: Fun.constant(section)
});

const rowdetails = (
  details: DetailNew[],
  section: Section
): RowDetails => ({
  details: Fun.constant(details),
  section: Fun.constant(section)
});

const bounds = (
  startRow: number,
  startCol: number,
  finishRow: number,
  finishCol: number
): Bounds => ({
  startRow:  Fun.constant(startRow),
  startCol: Fun.constant(startCol),
  finishRow: Fun.constant(finishRow),
  finishCol: Fun.constant(finishCol)
});

export {
  dimension,
  dimensions,
  grid,
  address,
  coords,
  extended,
  detail,
  detailnew,
  rowdata,
  elementnew,
  rowdatanew,
  rowcells,
  rowdetails,
  bounds
};
