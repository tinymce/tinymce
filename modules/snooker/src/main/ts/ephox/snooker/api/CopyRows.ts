import { HTMLTableRowElement } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { onCells, TargetSelection, toDetailList } from '../model/RunOperation';
import * as Transitions from '../model/Transitions';
import { Warehouse } from '../model/Warehouse';
import * as Redraw from '../operate/Redraw';
import { Generators } from './Generators';

const copyRows = function (table: Element, target: TargetSelection, generators: Generators): Option<Element<HTMLTableRowElement>[]> {
  const house = Warehouse.fromTable(table);
  const details = onCells(house, target);
  return details.map(function (selectedCells) {
    const grid = Transitions.toGrid(house, generators, false);
    const slicedGrid = grid.slice(selectedCells[0].row(), selectedCells[selectedCells.length - 1].row() + selectedCells[selectedCells.length - 1].rowspan());
    const slicedDetails = toDetailList(slicedGrid, generators);
    return Redraw.copy(slicedDetails);
  });
};

export {
  copyRows
};
