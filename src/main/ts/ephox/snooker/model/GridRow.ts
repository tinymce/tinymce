import { Arr } from '@ephox/katamari';
import Structs from '../api/Structs';

var addCell = function (gridRow, index, cell) {
  var cells = gridRow.cells();
  var before = cells.slice(0, index);
  var after = cells.slice(index);
  var newCells = before.concat([ cell ]).concat(after);
  return setCells(gridRow, newCells);
};

var mutateCell = function (gridRow, index, cell) {
  var cells = gridRow.cells();
  cells[index] = cell;
};

var setCells = function (gridRow, cells) {
  return Structs.rowcells(cells, gridRow.section());
};

var mapCells = function (gridRow, f) {
  var cells = gridRow.cells();
  var r = Arr.map(cells, f);
  return Structs.rowcells(r, gridRow.section());
};

var getCell = function (gridRow, index) {
  return gridRow.cells()[index];
};

var getCellElement = function (gridRow, index) {
  return getCell(gridRow, index).element();
};

var cellLength = function (gridRow) {
  return gridRow.cells().length;
};

export default {
  addCell: addCell,
  setCells: setCells,
  mutateCell: mutateCell,
  getCell: getCell,
  getCellElement: getCellElement,
  mapCells: mapCells,
  cellLength: cellLength
};