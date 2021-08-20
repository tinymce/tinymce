import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Structs from '../api/Structs';

type RowMorphism = (element: SugarElement<HTMLTableRowElement | HTMLTableColElement>) => SugarElement<HTMLTableRowElement | HTMLTableColElement>;
type CellMorphism = (element: Structs.ElementNew, index: number) => Structs.ElementNew;

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

const setCells = (gridRow: Structs.RowCells, cells: Structs.ElementNew[]): Structs.RowCells =>
  Structs.rowcells(gridRow.element, cells, gridRow.section, gridRow.isNew);

const mapCells = (gridRow: Structs.RowCells, f: CellMorphism): Structs.RowCells => {
  const cells = gridRow.cells;
  const r = Arr.map(cells, f);
  return Structs.rowcells(gridRow.element, r, gridRow.section, gridRow.isNew);
};

const getCell = (gridRow: Structs.RowCells, index: number): Structs.ElementNew =>
  gridRow.cells[index];

const getCellElement = (gridRow: Structs.RowCells, index: number): SugarElement =>
  getCell(gridRow, index).element;

const cellLength = (gridRow: Structs.RowCells): number =>
  gridRow.cells.length;

const extractGridDetails = (grid: Structs.RowCells[]): { rows: Structs.RowCells[]; cols: Structs.RowCells[] } => {
  const result = Arr.partition(grid, (row) => row.section === 'colgroup');
  return {
    rows: result.fail,
    cols: result.pass
  };
};

const clone = (gridRow: Structs.RowCells, cloneRow: RowMorphism, cloneCell: CellMorphism): Structs.RowCells => {
  const newCells = Arr.map(gridRow.cells, cloneCell);
  return Structs.rowcells(cloneRow(gridRow.element), newCells, gridRow.section, true);
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
  extractGridDetails,
  clone
};
