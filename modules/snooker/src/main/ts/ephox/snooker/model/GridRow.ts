import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Structs from '../api/Structs';
import { CellElement, RowCell, RowElement } from '../util/TableTypes';

type RowMorphism<T extends RowElement> = (element: SugarElement<T>) => SugarElement<T>;
type CellMorphism<T extends CellElement> = (element: Structs.ElementNew<T>, index: number) => Structs.ElementNew<T>;

const addCells = <R extends RowElement>(gridRow: Structs.RowCells<R>, index: number, cells: Structs.ElementNew<RowCell<R>>[]): Structs.RowCells<R> => {
  const existingCells = gridRow.cells;
  const before = existingCells.slice(0, index);
  const after = existingCells.slice(index);
  const newCells = before.concat(cells).concat(after);
  return setCells(gridRow, newCells);
};

const addCell = <R extends RowElement>(gridRow: Structs.RowCells<R>, index: number, cell: Structs.ElementNew<RowCell<R>>): Structs.RowCells<R> =>
  addCells(gridRow, index, [ cell ]);

const mutateCell = <R extends RowElement>(gridRow: Structs.RowCells<R>, index: number, cell: Structs.ElementNew<RowCell<R>>): void => {
  const cells = gridRow.cells;
  cells[index] = cell;
};

const setCells = <R extends RowElement>(gridRow: Structs.RowCells<R>, cells: Structs.ElementNew<RowCell<R>>[]): Structs.RowCells<R> =>
  Structs.rowcells(gridRow.element, cells, gridRow.section, gridRow.isNew);

const mapCells = <R extends RowElement>(gridRow: Structs.RowCells<R>, f: CellMorphism<RowCell<R>>): Structs.RowCells => {
  const cells = gridRow.cells;
  const r = Arr.map(cells, f);
  return Structs.rowcells(gridRow.element, r, gridRow.section, gridRow.isNew);
};

const getCell = <R extends RowElement>(gridRow: Structs.RowCells<R>, index: number): Structs.ElementNew<RowCell<R>> =>
  gridRow.cells[index];

const getCellElement = <R extends RowElement>(gridRow: Structs.RowCells<R>, index: number): SugarElement<RowCell<R>> =>
  getCell(gridRow, index).element;

const cellLength = (gridRow: Structs.RowCells): number =>
  gridRow.cells.length;

const extractGridDetails = (grid: Structs.RowCells[]): { rows: Structs.RowCells<HTMLTableRowElement>[]; cols: Structs.RowCells<HTMLTableColElement>[] } => {
  const result = Arr.partition(grid, (row) => row.section === 'colgroup');
  return {
    rows: result.fail as Structs.RowCells<HTMLTableRowElement>[],
    cols: result.pass as Structs.RowCells<HTMLTableColElement>[]
  };
};

const clone = <R extends RowElement>(gridRow: Structs.RowCells<R>, cloneRow: RowMorphism<R>, cloneCell: CellMorphism<RowCell<R>>): Structs.RowCells<R> => {
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
