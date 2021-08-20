import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

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

export interface Detail {
  readonly element: SugarElement;
  readonly rowspan: number;
  readonly colspan: number;
}

export interface DetailNew extends Detail {
  readonly isNew: boolean;
}

export interface DetailExt extends Detail {
  readonly row: number;
  readonly column: number;
  readonly isLocked: boolean;
}

export type Section = 'tfoot' | 'thead' | 'tbody' | 'colgroup';
const validSectionList: Section[] = [ 'tfoot', 'thead', 'tbody', 'colgroup' ];

export interface RowDetail<T extends Detail> {
  readonly element: SugarElement<HTMLTableRowElement | HTMLTableColElement>;
  readonly cells: T[];
  readonly section: Section;
}

export interface RowDetailNew<T extends Detail> extends RowDetail<T> {
  readonly isNew: boolean;
}

export interface RowCells {
  readonly element: SugarElement<HTMLTableRowElement | HTMLTableColElement>;
  readonly cells: ElementNew[];
  readonly section: Section;
  readonly isNew: boolean;
}

export interface ElementNew {
  readonly element: SugarElement;
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

const detail = (element: SugarElement<HTMLTableCellElement | HTMLTableColElement>, rowspan: number, colspan: number): Detail => ({
  element,
  rowspan,
  colspan
});

const detailnew = (element: SugarElement<HTMLTableCellElement>, rowspan: number, colspan: number, isNew: boolean): DetailNew => ({
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

const rowdetail = <T extends Detail> (element: SugarElement<HTMLTableRowElement | HTMLTableColElement>, cells: T[], section: Section): RowDetail<T> => ({
  element,
  cells,
  section
});

const rowdetailnew = <T extends Detail> (element: SugarElement, cells: T[], section: Section, isNew: boolean): RowDetailNew<T> => ({
  element,
  cells,
  section,
  isNew
});

const elementnew = (element: SugarElement, isNew: boolean, isLocked: boolean): ElementNew => ({
  element,
  isNew,
  isLocked
});

const rowcells = (element: SugarElement<HTMLTableRowElement | HTMLTableColElement>, cells: ElementNew[], section: Section, isNew: boolean): RowCells => ({
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
