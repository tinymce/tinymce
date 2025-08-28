import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { CellElement, RowElement, RowCell } from '../util/TableTypes';

export interface Dimension {
  readonly width: number;
  readonly height: number;
}

export interface Dimensions {
  readonly width: number[];
  readonly height: number[];
}

export interface Grid {
  readonly rows: number;
  readonly columns: number;
}

export interface Address {
  readonly row: number;
  readonly column: number;
}

export interface Coords {
  readonly x: number;
  readonly y: number;
}

export interface Detail<T extends CellElement = CellElement> {
  readonly element: SugarElement<T>;
  readonly rowspan: number;
  readonly colspan: number;
}

export interface DetailNew<T extends CellElement = CellElement> extends Detail<T> {
  readonly isNew: boolean;
}

export interface DetailExt extends Detail<HTMLTableCellElement> {
  readonly row: number;
  readonly column: number;
  readonly isLocked: boolean;
}

export type Section = 'tfoot' | 'thead' | 'tbody' | 'colgroup';
const validSectionList: Section[] = [ 'tfoot', 'thead', 'tbody', 'colgroup' ];

export interface RowDetail<T extends Detail<RowCell<R>>, R extends RowElement = RowElement> {
  readonly element: SugarElement<R>;
  readonly cells: T[];
  readonly section: Section;
}

export interface RowDetailNew<T extends Detail<RowCell<R>>, R extends RowElement = RowElement> extends RowDetail<T, R> {
  readonly isNew: boolean;
}

export interface RowCells<R extends RowElement = RowElement> {
  readonly element: SugarElement<R>;
  readonly cells: ElementNew<RowCell<R>>[];
  readonly section: Section;
  readonly isNew: boolean;
}

export interface ElementNew<T extends CellElement = CellElement> {
  readonly element: SugarElement<T>;
  readonly isNew: boolean;
  readonly isLocked: boolean;
}

export interface Column {
  readonly element: SugarElement<HTMLTableColElement>;
  readonly colspan: number;
}

export interface ColumnExt extends Column {
  readonly column: number;
}

export interface Colgroup<T extends Column> {
  readonly element: SugarElement<HTMLTableColElement>;
  readonly columns: T[];
}

export interface Bounds {
  readonly startRow: number;
  readonly startCol: number;
  readonly finishRow: number;
  readonly finishCol: number;
}

const isValidSection = (parentName: string): parentName is Section =>
  Arr.contains(validSectionList, parentName);

const dimension = (width: number, height: number): Dimension => ({
  width,
  height
});

const dimensions = (width: number[], height: number[]): Dimensions => ({
  width,
  height
});

const grid = (rows: number, columns: number): Grid => ({
  rows,
  columns
});

const address = (row: number, column: number): Address => ({
  row,
  column
});

const coords = (x: number, y: number): Coords => ({
  x,
  y
});

const detail = <T extends CellElement>(element: SugarElement<T>, rowspan: number, colspan: number): Detail<T> => ({
  element,
  rowspan,
  colspan
});

const detailnew = <T extends CellElement>(element: SugarElement<T>, rowspan: number, colspan: number, isNew: boolean): DetailNew<T> => ({
  element,
  rowspan,
  colspan,
  isNew
});

const extended = (element: SugarElement<HTMLTableCellElement>, rowspan: number, colspan: number, row: number, column: number, isLocked: boolean): DetailExt => ({
  element,
  rowspan,
  colspan,
  row,
  column,
  isLocked
});

const rowdetail = <T extends Detail<RowCell<R>>, R extends RowElement> (element: SugarElement<R>, cells: T[], section: Section): RowDetail<T, R> => ({
  element,
  cells,
  section
});

const rowdetailnew = <T extends Detail<RowCell<R>>, R extends RowElement> (element: SugarElement<R>, cells: T[], section: Section, isNew: boolean): RowDetailNew<T, R> => ({
  element,
  cells,
  section,
  isNew
});

const elementnew = <T extends CellElement>(element: SugarElement<T>, isNew: boolean, isLocked: boolean): ElementNew<T> => ({
  element,
  isNew,
  isLocked
});

const rowcells = <R extends RowElement>(element: SugarElement<R>, cells: ElementNew<RowCell<R>>[], section: Section, isNew: boolean): RowCells<R> => ({
  element,
  cells,
  section,
  isNew
});

const bounds = (startRow: number, startCol: number, finishRow: number, finishCol: number): Bounds => ({
  startRow,
  startCol,
  finishRow,
  finishCol
});

const columnext = (element: SugarElement<HTMLTableColElement>, colspan: number, column: number): ColumnExt => ({
  element,
  colspan,
  column
});

const colgroup = <T extends Column> (element: SugarElement<HTMLTableColElement>, columns: T[]): Colgroup<T> => ({
  element,
  columns
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
  rowdetail,
  elementnew,
  rowdetailnew,
  rowcells,
  bounds,
  isValidSection,
  columnext,
  colgroup
};
