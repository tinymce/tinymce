import { Struct } from '@ephox/katamari';

const dimensions = Struct.immutable('width', 'height');
const grid = Struct.immutable('rows', 'columns');
const address = Struct.immutable('row', 'column');
const coords = Struct.immutable('x', 'y');
const detail = Struct.immutable('element', 'rowspan', 'colspan');
const detailnew = Struct.immutable('element', 'rowspan', 'colspan', 'isNew');
const extended = Struct.immutable('element', 'rowspan', 'colspan', 'row', 'column');
const rowdata = Struct.immutable('element', 'cells', 'section');
const elementnew = Struct.immutable('element', 'isNew');
const rowdatanew = Struct.immutable('element', 'cells', 'section', 'isNew');
const rowcells = Struct.immutable('cells', 'section');
const rowdetails = Struct.immutable('details', 'section');
const bounds = Struct.immutable( 'startRow', 'startCol', 'finishRow', 'finishCol');

export default {
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