import { Arr } from '@ephox/katamari';
import Structs from '../api/Structs';

const addCell = function (gridRow, index, cell) {
  const cells = gridRow.cells();
  const before = cells.slice(0, index);
  const after = cells.slice(index);
  const newCells = before.concat([ cell ]).concat(after);
  return setCells(gridRow, newCells);
};

const mutateCell = function (gridRow, index, cell) {
  const cells = gridRow.cells();
  cells[index] = cell;
};

const setCells = function (gridRow, cells) {
  return Structs.rowcells(cells, gridRow.section());
};

const mapCells = function (gridRow, f) {
  const cells = gridRow.cells();
  const r = Arr.map(cells, f);
  return Structs.rowcells(r, gridRow.section());
};

const getCell = function (gridRow, index) {
  return gridRow.cells()[index];
};

const getCellElement = function (gridRow, index) {
  return getCell(gridRow, index).element();
};

const cellLength = function (gridRow) {
  return gridRow.cells().length;
};

export default {
  addCell,
  setCells,
  mutateCell,
  getCell,
  getCellElement,
  mapCells,
  cellLength
};