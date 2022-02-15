import { Arr, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as GridRow from '../model/GridRow';
import { onCells, TargetSelection, toDetailList } from '../model/RunOperation';
import * as Transitions from '../model/Transitions';
import { Generators } from './Generators';
import { DetailExt, RowCells } from './Structs';
import { Warehouse } from './Warehouse';

export interface OtherCells {
  readonly upOrLeftCells: SugarElement<HTMLTableCellElement>[];
  readonly downOrRightCells: SugarElement<HTMLTableCellElement>[];
}

const getUpOrLeftCells = (grid: RowCells<HTMLTableRowElement>[], selectedCells: DetailExt[]): SugarElement<HTMLTableCellElement>[] => {
  // Get rows up or at the row of the bottom right cell
  const upGrid = grid.slice(0, selectedCells[selectedCells.length - 1].row + 1);
  const upDetails = toDetailList(upGrid);
  // Get an array of the cells up or to the left of the bottom right cell
  return Arr.bind(upDetails, (detail) => {
    const slicedCells = detail.cells.slice(0, selectedCells[selectedCells.length - 1].column + 1);
    return Arr.map(slicedCells, (cell) => cell.element);
  });
};

const getDownOrRightCells = (grid: RowCells<HTMLTableRowElement>[], selectedCells: DetailExt[]): SugarElement<HTMLTableCellElement>[] => {
  // Get rows down or at the row of the top left cell (including rowspans)
  const downGrid = grid.slice(selectedCells[0].row + selectedCells[0].rowspan - 1, grid.length);
  const downDetails = toDetailList(downGrid);
  // Get an array of the cells down or to the right of the bottom right cell
  return Arr.bind(downDetails, (detail) => {
    const slicedCells = detail.cells.slice(selectedCells[0].column + selectedCells[0].colspan - 1, detail.cells.length);
    return Arr.map(slicedCells, (cell) => cell.element);
  });
};

const getOtherCells = (table: SugarElement<HTMLTableElement>, target: TargetSelection, generators: Generators): Optional<OtherCells> => {
  const warehouse = Warehouse.fromTable(table);
  const details = onCells(warehouse, target);

  return details.map((selectedCells) => {
    const grid = Transitions.toGrid(warehouse, generators, false);
    const { rows } = GridRow.extractGridDetails(grid);
    const upOrLeftCells = getUpOrLeftCells(rows, selectedCells);
    const downOrRightCells = getDownOrRightCells(rows, selectedCells);
    return {
      upOrLeftCells,
      downOrRightCells
    };
  });
};

export {
  getOtherCells
};
