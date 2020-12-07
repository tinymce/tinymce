import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import * as Structs from '../api/Structs';

const addCell = function (gridRow: Structs.RowCells, index: number, cell: Structs.ElementNew): Structs.RowCells {
  const cells = gridRow.cells;
  const before = cells.slice(0, index);
  const after = cells.slice(index);
  const newCells = before.concat([ cell ]).concat(after);
  return setCells(gridRow, newCells);
};

const mutateCell = function (gridRow: Structs.RowCells, index: number, cell: Structs.ElementNew): void {
  const cells = gridRow.cells;
  cells[index] = cell;
};

const setCells = function (gridRow: Structs.RowCells, cells: Structs.ElementNew[]): Structs.RowCells {
  return Structs.rowcells(cells, gridRow.section);
};

const mapCells = function (gridRow: Structs.RowCells, f: (ex: Structs.ElementNew, c: number) => Structs.ElementNew): Structs.RowCells {
  const cells = gridRow.cells;
  const r = Arr.map(cells, f);
  return Structs.rowcells(r, gridRow.section);
};

const getCell = function (gridRow: Structs.RowCells, index: number): Structs.ElementNew {
  return gridRow.cells[index];
};

const getCellElement = function (gridRow: Structs.RowCells, index: number): SugarElement {
  return getCell(gridRow, index).element;
};

const cellLength = function (gridRow: Structs.RowCells): number {
  return gridRow.cells.length;
};

const extractGridDetails = (grid: Structs.RowCells[]): { rows: Structs.RowCells[]; cols: Structs.RowCells[] } => {
  const result = Arr.partition(grid, (row) => row.section === 'colgroup');
  return {
    rows: result.fail,
    cols: result.pass
  };
};

export {
  addCell,
  setCells,
  mutateCell,
  getCell,
  getCellElement,
  mapCells,
  cellLength,
  extractGridDetails
};
