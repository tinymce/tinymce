import { Arr, Optional } from '@ephox/katamari';
import { Attribute, InsertAll, Replication, SugarElement } from '@ephox/sugar';

import { onUnlockedCells, TargetSelection } from '../model/RunOperation';
import * as CellUtils from '../util/CellUtils';
import { CellElement } from '../util/TableTypes';
import { ColumnExt, DetailExt } from './Structs';
import { Warehouse } from './Warehouse';

const constrainSpan = (element: SugarElement<CellElement>, property: 'colspan' | 'rowspan' | 'span', value: number) => {
  const currentColspan = CellUtils.getAttrValue(element, property, 1);
  if (value === 1 || currentColspan <= 1) {
    Attribute.remove(element, property);
  } else {
    Attribute.set(element, property, Math.min(value, currentColspan));
  }
};

const isColInRange = (minColRange: number, maxColRange: number) =>
  (cell: ColumnExt | DetailExt) => {
    const endCol = cell.column + cell.colspan - 1;
    const startCol = cell.column;
    return endCol >= minColRange && startCol < maxColRange;
  };

const generateColGroup = (house: Warehouse, minColRange: number, maxColRange: number): SugarElement<HTMLTableColElement>[] => {
  if (Warehouse.hasColumns(house)) {
    const colsToCopy = Arr.filter(Warehouse.justColumns(house), isColInRange(minColRange, maxColRange));
    const copiedCols = Arr.map(colsToCopy, (c) => {
      const clonedCol = Replication.deep(c.element);
      constrainSpan(clonedCol, 'span', maxColRange - minColRange);
      return clonedCol;
    });
    const fakeColgroup = SugarElement.fromTag('colgroup');
    InsertAll.append(fakeColgroup, copiedCols);
    return [ fakeColgroup ];
  } else {
    return [];
  }
};

const generateRows = (house: Warehouse, minColRange: number, maxColRange: number): SugarElement<HTMLTableRowElement>[] =>
  Arr.map(house.all, (row) => {
    const cellsToCopy = Arr.filter(row.cells, isColInRange(minColRange, maxColRange));
    const copiedCells = Arr.map(cellsToCopy, (cell) => {
      const clonedCell = Replication.deep(cell.element);
      constrainSpan(clonedCell, 'colspan', maxColRange - minColRange);
      return clonedCell;
    });
    const fakeTR = SugarElement.fromTag('tr');
    InsertAll.append(fakeTR, copiedCells);
    return fakeTR;
  });

const copyCols = (table: SugarElement<HTMLTableElement>, target: TargetSelection): Optional<SugarElement<HTMLTableRowElement | HTMLTableColElement>[]> => {
  const house = Warehouse.fromTable(table);
  const details = onUnlockedCells(house, target);
  return details.map((selectedCells): SugarElement<HTMLTableRowElement | HTMLTableColElement>[] => {
    const lastSelectedCell = selectedCells[selectedCells.length - 1];
    const minColRange = selectedCells[0].column;
    const maxColRange = lastSelectedCell.column + lastSelectedCell.colspan;

    const fakeColGroups = generateColGroup(house, minColRange, maxColRange);
    const fakeRows = generateRows(house, minColRange, maxColRange);
    return [ ...fakeColGroups, ...fakeRows ];
  });
};

export {
  copyCols
};
