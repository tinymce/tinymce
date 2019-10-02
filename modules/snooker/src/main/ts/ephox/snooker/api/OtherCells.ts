import DetailsList from '../model/DetailsList';
import { toDetailList, onCells, TargetSelection } from '../model/RunOperation';
import Transitions from '../model/Transitions';
import { Warehouse } from '../model/Warehouse';
import { Element } from '@ephox/sugar';
import { Generators } from './Generators';
import { Arr } from '@ephox/katamari';

const getUpOrLeft = (table: Element, target: TargetSelection, generators: Generators) => {
  const list = DetailsList.fromTable(table);
  const house = Warehouse.generate(list);
  const details = onCells(house, target);
  return details.map(function (selectedCells) {
    const grid = Transitions.toGrid(house, generators, false);
    const slicedGrid = grid.slice(0, selectedCells[0].row() + 1);
    const slicedDetails = toDetailList(slicedGrid, generators);
    return Arr.bind(slicedDetails, (detail) => {
      const slicedCells = detail.cells().slice(0, selectedCells[0].column() + 1);
      return Arr.map(slicedCells, (cell) => {
        return cell.element();
      });
    });
  });
};

export default {
  getUpOrLeft
};