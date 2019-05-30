import DetailsList from '../model/DetailsList';
import RunOperation from '../model/RunOperation';
import Transitions from '../model/Transitions';
import Warehouse from '../model/Warehouse';
import Redraw from '../operate/Redraw';

const copyRows = function (table, target, generators) {
  const list = DetailsList.fromTable(table);
  const house = Warehouse.generate(list);
  const details = RunOperation.onCells(house, target);
  return details.map(function (selectedCells) {
    const grid = Transitions.toGrid(house, generators, false);
    const slicedGrid = grid.slice(selectedCells[0].row(), selectedCells[selectedCells.length - 1].row() + selectedCells[selectedCells.length - 1].rowspan());
    const slicedDetails = RunOperation.toDetailList(slicedGrid, generators);
    return Redraw.copy(slicedDetails);
  });
};

export default {
  copyRows
};