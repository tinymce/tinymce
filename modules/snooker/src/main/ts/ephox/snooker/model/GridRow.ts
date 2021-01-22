import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import * as Structs from '../api/Structs';

const addCells = (gridRow: Structs.RowCells, index: number, cells: Structs.ElementNew[]): Structs.RowCells => {
  const existingCells = gridRow.cells;
  const before = existingCells.slice(0, index);
  const after = existingCells.slice(index);
  const newCells = before.concat(cells).concat(after);
  return setCells(gridRow, newCells);
};

const addCell = (gridRow: Structs.RowCells, index: number, cell: Structs.ElementNew): Structs.RowCells =>
  addCells(gridRow, index, [ cell ]);

const mutateCell = (gridRow: Structs.RowCells, index: number, cell: Structs.ElementNew): void => {
  const cells = gridRow.cells;
  cells[index] = cell;
};

const setCells = (gridRow: Structs.RowCells, cells: Structs.ElementNew[]): Structs.RowCells => {
  return Structs.rowcells(cells, gridRow.section);
};

const mapCells = (gridRow: Structs.RowCells, f: (ex: Structs.ElementNew, c: number) => Structs.ElementNew): Structs.RowCells => {
  const cells = gridRow.cells;
  const r = Arr.map(cells, f);
  return Structs.rowcells(r, gridRow.section);
};

const getCell = (gridRow: Structs.RowCells, index: number): Structs.ElementNew => {
  return gridRow.cells[index];
};

const getCellElement = (gridRow: Structs.RowCells, index: number): SugarElement => {
  return getCell(gridRow, index).element;
};

const cellLength = (gridRow: Structs.RowCells): number => {
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
  addCells,
  setCells,
  mutateCell,
  getCell,
  getCellElement,
  mapCells,
  cellLength,
  extractGridDetails
};
