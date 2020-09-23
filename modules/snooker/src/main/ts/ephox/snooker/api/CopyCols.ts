import { Arr, Optional, Obj } from '@ephox/katamari';
import { Attribute, InsertAll, Replication, SugarElement } from '@ephox/sugar';
import { onCells, TargetSelection } from '../model/RunOperation';
import * as CellUtils from '../util/CellUtils';
import { Warehouse } from './Warehouse';

const constrainSpan = (element: SugarElement, property: 'colspan' | 'rowspan', value: number) => {
  const currentColspan = CellUtils.getSpan(element, property);
  if (value === 1 || currentColspan <= 1) {
    Attribute.remove(element, property);
  } else {
    Attribute.set(element, property, Math.min(value, currentColspan));
  }
};

const copyCols = (table: SugarElement, target: TargetSelection): Optional<SugarElement<HTMLTableRowElement | HTMLTableColElement>[]> => {
  const house = Warehouse.fromTable(table);
  const details = onCells(house, target);
  return details.map((selectedCells): SugarElement<HTMLTableRowElement | HTMLTableColElement>[] => {
    const lastSelectedCell = selectedCells[selectedCells.length - 1];
    const minColRange = selectedCells[0].column;
    const maxColRange = lastSelectedCell.column + lastSelectedCell.colspan;
    const cols = Arr.filter(Obj.values(house.columns), (_col, i) => i >= minColRange && i < maxColRange);
    const fakeColgroup = SugarElement.fromTag('colgroup');
    InsertAll.append(fakeColgroup, Arr.map(cols, (c) => Replication.deep(c.element)));

    const fakeRows = Arr.map(house.all, (row) => {
      const cellsToCopy = Arr.filter(row.cells, (cell) => cell.column >= minColRange && cell.column < maxColRange);
      const copiedCells = Arr.map(cellsToCopy, (cell) => {
        const clonedCell = Replication.deep(cell.element);
        constrainSpan(clonedCell, 'colspan', maxColRange - minColRange);
        return clonedCell;
      });
      const fakeTR = SugarElement.fromTag('tr');
      InsertAll.append(fakeTR, copiedCells);
      return fakeTR;
    });

    return [ fakeColgroup, ...fakeRows ];
  });
};

export {
  copyCols
};
