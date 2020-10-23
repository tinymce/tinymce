import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import * as GridRow from '../model/GridRow';
import { onCells, TargetSelection, toDetailList } from '../model/RunOperation';
import * as Transitions from '../model/Transitions';
import * as Redraw from '../operate/Redraw';
import { Generators } from './Generators';
import { Warehouse } from './Warehouse';

const copyRows = (table: SugarElement<HTMLTableElement>, target: TargetSelection, generators: Generators): Optional<SugarElement<HTMLTableRowElement>[]> => {
  const warehouse = Warehouse.fromTable(table);
  const details = onCells(warehouse, target);

  return details.map((selectedCells) => {
    const grid = Transitions.toGrid(warehouse, generators, false);
    const rows = GridRow.extractGridDetails(grid).rows;
    const slicedGrid = rows.slice(selectedCells[0].row, selectedCells[selectedCells.length - 1].row + selectedCells[selectedCells.length - 1].rowspan);
    const slicedDetails = toDetailList(slicedGrid, generators);
    return Redraw.copy(slicedDetails);
  });
};

export {
  copyRows
};
