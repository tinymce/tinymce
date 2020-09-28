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
}

export type Section = 'tfoot' | 'thead' | 'tbody' | 'colgroup';
const validSectionList: Section[] = [ 'tfoot', 'thead', 'tbody', 'colgroup' ];

export interface RowCells {
  readonly cells: ElementNew[];
  readonly section: Section;
}

export interface RowData<T> {
  readonly element: SugarElement;
  readonly cells: T[];
  readonly section: Section;
}

export interface RowDataNew<T> extends RowData<T> {
  readonly isNew: boolean;
}

export interface ElementNew {
  readonly element: SugarElement;
  readonly isNew: boolean;
}

export interface RowDetails {
  readonly details: DetailNew[];
  readonly section: Section;
}

export interface Column {
  readonly element: SugarElement<HTMLTableColElement>;
  readonly colspan: number;
}

export interface ColumnExt extends Column {
  readonly column: number;
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

const extended = (element: SugarElement<HTMLTableCellElement>, rowspan: number, colspan: number, row: number, column: number): DetailExt => ({
  element,
  rowspan,
  colspan,
  row,
  column
});

const rowdata = <T> (element: SugarElement<HTMLTableRowElement | HTMLTableColElement>, cells: T[], section: Section): RowData<T> => ({
  element,
  cells,
  section
});

const elementnew = (element: SugarElement, isNew: boolean): ElementNew => ({
  element,
  isNew
});

const rowdatanew = <T> (element: SugarElement, cells: T[], section: Section, isNew: boolean): RowDataNew<T> => ({
  element,
  cells,
  section,
  isNew
});

const rowcells = (cells: ElementNew[], section: Section): RowCells => ({
  cells,
  section
});

const rowdetails = (details: DetailNew[], section: Section): RowDetails => ({
  details,
  section
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
  bounds,
  isValidSection,
  columnext
};
