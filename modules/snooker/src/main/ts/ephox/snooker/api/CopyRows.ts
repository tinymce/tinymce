import { Arr, Optional, Optionals } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as GridRow from '../model/GridRow';
import { onCells, TargetSelection, toDetailList } from '../model/RunOperation';
import * as Transitions from '../model/Transitions';
import * as Redraw from '../operate/Redraw';
import { Generators } from './Generators';
import { Warehouse } from './Warehouse';

const copyRows = (table: SugarElement<HTMLTableElement>, target: TargetSelection, generators: Generators): Optional<SugarElement<HTMLTableRowElement | HTMLTableColElement>[]> => {
  const warehouse = Warehouse.fromTable(table);
  // Cannot use onUnlockedCells like extractor here as if only cells in a locked column are selected, then this will be Optional.none and
  // there is now no way of knowing which rows are selected
  const details = onCells(warehouse, target);

  return details.bind((selectedCells) => {
    const grid = Transitions.toGrid(warehouse, generators, false);
    const rows = GridRow.extractGridDetails(grid).rows;
    const slicedGrid = rows.slice(selectedCells[0].row, selectedCells[selectedCells.length - 1].row + selectedCells[selectedCells.length - 1].rowspan);
    // Remove any locked cells from the copied grid rows
    const filteredGrid = Arr.bind(slicedGrid, (row) => {
      const newCells = Arr.filter(row.cells, (cell) => !cell.isLocked);
      return newCells.length > 0 ? [{ ...row, cells: newCells }] : [];
    });
    const slicedDetails = toDetailList(filteredGrid);
    return Optionals.someIf(slicedDetails.length > 0, slicedDetails);
  }).map((slicedDetails) => Redraw.copy(slicedDetails));
};

export {
  copyRows
};
