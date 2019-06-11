import DetailsList from '../model/DetailsList';
import { toDetailList, onCells, TargetSelection } from '../model/RunOperation';
import Transitions from '../model/Transitions';
import { Warehouse } from '../model/Warehouse';
import Redraw from '../operate/Redraw';
import { Element } from '@ephox/sugar';
import { Generators } from './Generators';

const copyRows = function (table: Element, target: TargetSelection, generators: Generators) {
  const list = DetailsList.fromTable(table);
  const house = Warehouse.generate(list);
  const details = onCells(house, target);
  return details.map(function (selectedCells) {
    const grid = Transitions.toGrid(house, generators, false);
    const slicedGrid = grid.slice(selectedCells[0].row(), selectedCells[selectedCells.length - 1].row() + selectedCells[selectedCells.length - 1].rowspan());
    const slicedDetails = toDetailList(slicedGrid, generators);
    return Redraw.copy(slicedDetails);
  });
};

export default {
  copyRows
};