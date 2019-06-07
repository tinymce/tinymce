import { Arr } from '@ephox/katamari';
import * as Structs from '../api/Structs';

const addCell = function (gridRow: Structs.RowCells, index: number, cell: Structs.ElementNew) {
  const cells = gridRow.cells();
  const before = cells.slice(0, index);
  const after = cells.slice(index);
  const newCells = before.concat([ cell ]).concat(after);
  return setCells(gridRow, newCells);
};

const mutateCell = function (gridRow: Structs.RowCells, index: number, cell: Structs.ElementNew) {
  const cells = gridRow.cells();
  cells[index] = cell;
};

const setCells = function (gridRow: Structs.RowCells, cells: Structs.ElementNew[]) {
  return Structs.rowcells(cells, gridRow.section());
};

const mapCells = function (gridRow: Structs.RowCells, f: (ex: Structs.ElementNew, c: number, a: ArrayLike<Structs.ElementNew>) => Structs.ElementNew) {
  const cells = gridRow.cells();
  const r = Arr.map(cells, f);
  return Structs.rowcells(r, gridRow.section());
};

const getCell = function (gridRow: Structs.RowCells, index: number) {
  return gridRow.cells()[index];
};

const getCellElement = function (gridRow: Structs.RowCells, index: number) {
  return getCell(gridRow, index).element();
};

const cellLength = function (gridRow: Structs.RowCells) {
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