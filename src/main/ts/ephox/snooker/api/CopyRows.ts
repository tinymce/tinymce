import DetailsList from '../model/DetailsList';
import RunOperation from '../model/RunOperation';
import Transitions from '../model/Transitions';
import Warehouse from '../model/Warehouse';
import Redraw from '../operate/Redraw';

var copyRows = function (table, target, generators) {
  var list = DetailsList.fromTable(table);
  var house = Warehouse.generate(list);
  var details = RunOperation.onCells(house, target);
  return details.map(function (selectedCells) {
    var grid = Transitions.toGrid(house, generators, false);
    var slicedGrid = grid.slice(selectedCells[0].row(), selectedCells[selectedCells.length - 1].row() + selectedCells[selectedCells.length - 1].rowspan());
    var slicedDetails = RunOperation.toDetailList(slicedGrid, generators);
    return Redraw.copy(slicedDetails);
  });
};

export default {
  copyRows:copyRows
};