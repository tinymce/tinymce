import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { onCells, TargetSelection, toDetailList } from '../model/RunOperation';
import * as Transitions from '../model/Transitions';
import * as Redraw from '../operate/Redraw';
import { Generators } from './Generators';
import { Warehouse } from './Warehouse';

const copyRows = function (table: SugarElement, target: TargetSelection, generators: Generators): Optional<SugarElement<HTMLTableRowElement>[]> {
  const house = Warehouse.fromTable(table);
  const details = onCells(house, target);
  return details.map(function (selectedCells) {
    const grid = Transitions.toGrid(house, generators, false);
    const slicedGrid = grid.slice(selectedCells[0].row, selectedCells[selectedCells.length - 1].row + selectedCells[selectedCells.length - 1].rowspan);
    const slicedDetails = toDetailList(slicedGrid, generators);
    return Redraw.copy(slicedDetails);
  });
};

export {
  copyRows
};
