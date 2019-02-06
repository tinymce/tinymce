import { Struct } from '@ephox/katamari';

var dimensions = Struct.immutable('width', 'height');
var grid = Struct.immutable('rows', 'columns');
var address = Struct.immutable('row', 'column');
var coords = Struct.immutable('x', 'y');
var detail = Struct.immutable('element', 'rowspan', 'colspan');
var detailnew = Struct.immutable('element', 'rowspan', 'colspan', 'isNew');
var extended = Struct.immutable('element', 'rowspan', 'colspan', 'row', 'column');
var rowdata = Struct.immutable('element', 'cells', 'section');
var elementnew = Struct.immutable('element', 'isNew');
var rowdatanew = Struct.immutable('element', 'cells', 'section', 'isNew');
var rowcells = Struct.immutable('cells', 'section');
var rowdetails = Struct.immutable('details', 'section');
var bounds = Struct.immutable( 'startRow', 'startCol', 'finishRow', 'finishCol');

export default {
  dimensions: dimensions,
  grid: grid,
  address: address,
  coords: coords,
  extended: extended,
  detail: detail,
  detailnew: detailnew,
  rowdata: rowdata,
  elementnew: elementnew,
  rowdatanew: rowdatanew,
  rowcells: rowcells,
  rowdetails: rowdetails,
  bounds: bounds
};