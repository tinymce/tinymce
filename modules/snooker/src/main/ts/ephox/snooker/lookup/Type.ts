import { Arr, Optional, Optionals } from '@ephox/katamari';
import { SugarNode } from '@ephox/sugar';

import * as Structs from '../api/Structs';
import { Warehouse } from '../api/Warehouse';

export type RowHeaderType = 'section' | 'cells' | 'sectionCells';
export type RowType = 'header' | 'body' | 'footer';

interface RowDetails {
  readonly type: RowType;
  readonly subType?: string;
}

const isTableHeaderCell = SugarNode.isTag('th');

const getRowHeaderType = (isHeaderRow: boolean, isHeaderCells: boolean): RowHeaderType => {
  if (isHeaderRow && isHeaderCells) {
    return 'sectionCells';
  } else if (isHeaderRow) {
    return 'section';
  } else {
    return 'cells';
  }
};

const getRowType = (row: Structs.RowDetail<Structs.DetailExt>): RowDetails => {
  // Header rows can use a combination of theads and ths - want to detect the different combinations
  const isHeaderRow = row.section === 'thead';
  const isHeaderCells = Optionals.is(findCommonCellType(row.cells), 'th');
  if (isHeaderRow || isHeaderCells) {
    return { type: 'header', subType: getRowHeaderType(isHeaderRow, isHeaderCells) };
  } else if (row.section === 'tfoot') {
    return { type: 'footer' };
  } else {
    return { type: 'body' };
  }
};

const findCommonCellType = (cells: Structs.DetailExt[]): Optional<'td' | 'th'> => {
  const headerCells = Arr.filter(cells, (cell) => isTableHeaderCell(cell.element));
  if (headerCells.length === 0) {
    return Optional.some('td');
  } else if (headerCells.length === cells.length) {
    return Optional.some('th');
  } else {
    return Optional.none();
  }
};

const findCommonRowType = (rows: Structs.RowDetail<Structs.DetailExt>[]): Optional<RowType> => {
  const rowTypes = Arr.map(rows, (row) => getRowType(row).type);
  const hasHeader = Arr.contains(rowTypes, 'header');
  const hasFooter = Arr.contains(rowTypes, 'footer');
  if (!hasHeader && !hasFooter) {
    return Optional.some('body');
  } else {
    const hasBody = Arr.contains(rowTypes, 'body');
    if (hasHeader && !hasBody && !hasFooter) {
      return Optional.some('header');
    } else if (!hasHeader && !hasBody && hasFooter) {
      return Optional.some('footer');
    } else {
      return Optional.none();
    }
  }
};

const findTableRowHeaderType = (warehouse: Warehouse): Optional<RowHeaderType> =>
  Arr.findMap(warehouse.all, (row) => {
    const rowType = getRowType(row);
    return rowType.type === 'header' ? Optional.from(rowType.subType as RowHeaderType) : Optional.none();
  });

export {
  findCommonCellType,
  findCommonRowType,
  findTableRowHeaderType
};
