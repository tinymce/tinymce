import { Struct } from '@ephox/katamari';
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

export interface Extended extends Detail {
  row: () => number;
  column: () => number;
}

type Section = 'tfoot' | 'thead' | 'tbody';

export interface RowCells {
  cells: () => ElementNew[];
  section: () => Section;
}

export interface RowDataDetail {
  element: () => Element;
  cells: () => Detail[];
  section: () => Section;
}

export interface RowDataExtended extends RowDataDetail {
  element: () => Element;
  cells: () => Extended[];
  section: () => Section;
}

export interface RowDataNew extends RowDataDetail {
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

const dimension: (width: number, height: number) => Dimension = Struct.immutable('width', 'height');
const dimensions: (width: number[], height: number[]) => Dimensions = Struct.immutable('width', 'height');
const grid: (rows: number, columns: number) => Grid = Struct.immutable('rows', 'columns');
const address: (row: number, column: number) => Address = Struct.immutable('row', 'column');
const coords: (x: number, y: number) => Coords = Struct.immutable('x', 'y');
const detail: (element: Element, rowspan: number, colspan: number) => Detail = Struct.immutable('element', 'rowspan', 'colspan');
const detailnew: (element: Element, rowspan: number, colspan: number, isNew: boolean) => DetailNew = Struct.immutable('element', 'rowspan', 'colspan', 'isNew');
const extended: (element: Element, rowspan: number, colspan: number, row: number, column: number) => Extended = Struct.immutable('element', 'rowspan', 'colspan', 'row', 'column');
const rowdatadetail: (element: Element, cells: Detail[], section: Section) => RowDataDetail = Struct.immutable('element', 'cells', 'section');
const rowdataextended: (element: Element, cells: Extended[], section: Section) => RowDataExtended = Struct.immutable('element', 'cells', 'section');
const elementnew: (element: Element, isNew: boolean) => ElementNew = Struct.immutable('element', 'isNew');
const rowdatanew: (element: Element, cells: Detail[], section: Section, isNew: boolean) => RowDataNew = Struct.immutable('element', 'cells', 'section', 'isNew');
const rowcells: (cells: ElementNew[], section: Section) => RowCells = Struct.immutable('cells', 'section');
const rowdetails: (details: DetailNew[], section: Section) => RowDetails =  Struct.immutable('details', 'section');
const bounds: (startRow: number, startCol: number, finishRow: number, finishCol: number) => Bounds = Struct.immutable( 'startRow', 'startCol', 'finishRow', 'finishCol');

export {
  dimension,
  dimensions,
  grid,
  address,
  coords,
  extended,
  detail,
  detailnew,
  rowdatadetail,
  rowdataextended,
  elementnew,
  rowdatanew,
  rowcells,
  rowdetails,
  bounds
};