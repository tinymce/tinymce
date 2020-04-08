import * as DetailsList from '../model/DetailsList';
import { onCells, TargetSelection } from '../model/RunOperation';
import * as Transitions from '../model/Transitions';
import { Warehouse } from '../model/Warehouse';
import { Element, Replication, InsertAll } from '@ephox/sugar';
import { Generators } from './Generators';
import { Arr } from '@ephox/katamari/src/main/ts/ephox/katamari/api/Main';

const copyCols = function (table: Element, target: TargetSelection, generators: Generators) {
  const list = DetailsList.fromTable(table);
  const house = Warehouse.generate(list);
  const details = onCells(house, target);
  return details.map(function (selectedCells) {
    const grid = Transitions.toGrid(house, generators, false);
    const slicedGrid = Arr.map(grid, (row) => {
      const cellsToCopy = row.cells().slice(selectedCells[0].column(), selectedCells[selectedCells.length - 1].column() + selectedCells[selectedCells.length -1 ].colspan());
      const copiedCells = Arr.map(cellsToCopy, (cell) => {
        return Replication.deep(cell.element());
      });
      const fakeTR = Element.fromTag('tr');
      InsertAll.append(fakeTR, copiedCells);
      return fakeTR
    });
    return slicedGrid;
  });
};

export {
  copyCols
};
