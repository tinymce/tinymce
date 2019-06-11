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

const dimension: (
  width: ReturnType<Dimension['width']>,
  height: ReturnType<Dimension['height']>
) => Dimension = Struct.immutable('width', 'height');

const dimensions: (
  width: ReturnType<Dimensions['width']>,
  height: ReturnType<Dimensions['height']>
) => Dimensions = Struct.immutable('width', 'height');

const grid: (
  rows: ReturnType<Grid['rows']>,
  columns: ReturnType<Grid['columns']>
) => Grid = Struct.immutable('rows', 'columns');

const address: (
  row: ReturnType<Address['row']>,
  column: ReturnType<Address['column']>
) => Address = Struct.immutable('row', 'column');

const coords: (
  x: ReturnType<Coords['x']>,
  y: ReturnType<Coords['y']>
) => Coords = Struct.immutable('x', 'y');

const detail: (
  element: ReturnType<Detail['element']>,
  rowspan: ReturnType<Detail['rowspan']>,
  colspan: ReturnType<Detail['colspan']>
) => Detail = Struct.immutable('element', 'rowspan', 'colspan');

const detailnew: (
  element: ReturnType<DetailNew['element']>,
  rowspan: ReturnType<DetailNew['rowspan']>,
  colspan: ReturnType<DetailNew['colspan']>,
  isNew: ReturnType<DetailNew['isNew']>
) => DetailNew = Struct.immutable('element', 'rowspan', 'colspan', 'isNew');

const extended: (
  element: ReturnType<DetailExt['element']>,
  rowspan: ReturnType<DetailExt['rowspan']>,
  colspan: ReturnType<DetailExt['colspan']>,
  row: ReturnType<DetailExt['row']>,
  column: ReturnType<DetailExt['column']>
) => DetailExt = Struct.immutable('element', 'rowspan', 'colspan', 'row', 'column');

const rowdata: <T> (
  element: ReturnType<RowData<T>['element']>,
  cells: ReturnType<RowData<T>['cells']>,
  section: ReturnType<RowData<T>['section']>
) => RowData<T> = Struct.immutable('element', 'cells', 'section');

const elementnew: (
  element: ReturnType<ElementNew['element']>,
  isNew: ReturnType<ElementNew['isNew']>
) => ElementNew = Struct.immutable('element', 'isNew');

const rowdatanew: <T> (
  element: ReturnType<RowDataNew<T>['element']>,
  cells: ReturnType<RowDataNew<T>['cells']>,
  section: ReturnType<RowDataNew<T>['section']>,
  isNew: ReturnType<RowDataNew<T>['isNew']>
) => RowDataNew<T> = Struct.immutable('element', 'cells', 'section', 'isNew');

const rowcells: (
  cells: ReturnType<RowCells['cells']>,
  section: ReturnType<RowCells['section']>
) => RowCells = Struct.immutable('cells', 'section');

const rowdetails: (
  details: ReturnType<RowDetails['details']>,
  section: ReturnType<RowDetails['section']>
) => RowDetails =  Struct.immutable('details', 'section');

const bounds: (
  startRow: ReturnType<Bounds['startRow']>,
  startCol: ReturnType<Bounds['startCol']>,
  finishRow: ReturnType<Bounds['finishRow']>,
  finishCol: ReturnType<Bounds['finishCol']>
) => Bounds = Struct.immutable( 'startRow', 'startCol', 'finishRow', 'finishCol');

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