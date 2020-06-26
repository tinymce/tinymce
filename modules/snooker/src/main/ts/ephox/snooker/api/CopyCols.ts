import { HTMLTableRowElement } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { Attr, Element, InsertAll, Replication } from '@ephox/sugar';
import { onCells, TargetSelection } from '../model/RunOperation';
import { Warehouse } from '../model/Warehouse';
import * as CellUtils from '../util/CellUtils';

const constrainSpan = (element: Element, property: 'colspan' | 'rowspan', value: number) => {
  const currentColspan = CellUtils.getSpan(element, property);
  if (value === 1 || currentColspan <= 1) {
    Attr.remove(element, property);
  } else {
    Attr.set(element, property, Math.min(value, currentColspan));
  }
};

const copyCols = (table: Element, target: TargetSelection): Option<Element<HTMLTableRowElement>[]> => {
  const house = Warehouse.fromTable(table);
  const details = onCells(house, target);
  return details.map((selectedCells) => {
    const lastSelectedCell = selectedCells[selectedCells.length - 1];
    const minColRange = selectedCells[0].column();
    const maxColRange = lastSelectedCell.column() + lastSelectedCell.colspan();
    return Arr.map(house.all, (row) => {
      const cellsToCopy = Arr.filter(row.cells(), (cell) => cell.column() >= minColRange && cell.column() < maxColRange);
      const copiedCells = Arr.map(cellsToCopy, (cell) => {
        const clonedCell = Replication.deep(cell.element());
        constrainSpan(clonedCell, 'colspan', maxColRange - minColRange);
        return clonedCell;
      });
      const fakeTR = Element.fromTag('tr');
      InsertAll.append(fakeTR, copiedCells);
      return fakeTR;
    });
  });
};

export {
  copyCols
};
