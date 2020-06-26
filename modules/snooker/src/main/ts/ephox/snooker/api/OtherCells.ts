import { HTMLTableElement } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { onCells, TargetSelection, toDetailList } from '../model/RunOperation';
import * as Transitions from '../model/Transitions';
import { Warehouse } from '../model/Warehouse';
import { Generators } from './Generators';
import { DetailExt, RowCells } from './Structs';

const getUpOrLeftCells = (grid: RowCells[], selectedCells: DetailExt[], generators: Generators): Element[] => {
  // Get rows up or at the row of the bottom right cell
  const upGrid = grid.slice(0, selectedCells[selectedCells.length - 1].row() + 1);
  const upDetails = toDetailList(upGrid, generators);
  // Get an array of the cells up or to the left of the bottom right cell
  return Arr.bind(upDetails, (detail) => {
    const slicedCells = detail.cells().slice(0, selectedCells[selectedCells.length - 1].column() + 1);
    return Arr.map(slicedCells, (cell) => cell.element());
  });
};

const getDownOrRightCells = (grid: RowCells[], selectedCells: DetailExt[], generators: Generators): Element[] => {
  // Get rows down or at the row of the top left cell (including rowspans)
  const downGrid = grid.slice(selectedCells[0].row() + selectedCells[0].rowspan() - 1, grid.length);
  const downDetails = toDetailList(downGrid, generators);
  // Get an array of the cells down or to the right of the bottom right cell
  return Arr.bind(downDetails, (detail) => {
    const slicedCells = detail.cells().slice(selectedCells[0].column() + selectedCells[0].colspan() - 1, + detail.cells().length);
    return Arr.map(slicedCells, (cell) => cell.element());
  });
};

const getOtherCells = (table: Element<HTMLTableElement>, target: TargetSelection, generators: Generators) => {
  const house = Warehouse.fromTable(table);
  const details = onCells(house, target);
  return details.map(function (selectedCells) {
    const grid = Transitions.toGrid(house, generators, false);
    const upOrLeftCells = getUpOrLeftCells(grid, selectedCells, generators);
    const downOrRightCells = getDownOrRightCells(grid, selectedCells, generators);
    return {
      upOrLeftCells,
      downOrRightCells
    };
  });
};

export {
  getOtherCells
};
