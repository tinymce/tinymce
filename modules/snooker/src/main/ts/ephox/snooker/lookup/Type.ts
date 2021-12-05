import { Arr, Optional, Optionals } from '@ephox/katamari';
import { SugarElement, SugarNode } from '@ephox/sugar';

import * as Structs from '../api/Structs';
import { Warehouse } from '../api/Warehouse';
import { CellElement } from '../util/TableTypes';

export type RowHeaderType = 'section' | 'cells' | 'sectionCells';
export type RowType = 'header' | 'body' | 'footer';

interface RowDetails {
  readonly type: RowType;
  readonly subType?: string;
}

interface CommonCellDetails {
  readonly element: SugarElement<CellElement>;
}

interface CommonRowDetails {
  readonly cells: CommonCellDetails[];
  readonly section: Structs.Section;
}

const isHeaderCell = SugarNode.isTag('th');

const isHeaderCells = (cells: CommonCellDetails[]): boolean =>
  Arr.forall(cells, (cell) => isHeaderCell(cell.element));

const getRowHeaderType = (isHeaderRow: boolean, isHeaderCells: boolean): RowHeaderType => {
  if (isHeaderRow && isHeaderCells) {
    return 'sectionCells';
  } else if (isHeaderRow) {
    return 'section';
  } else {
    return 'cells';
  }
};

const getRowType = (row: CommonRowDetails): RowDetails => {
  // Header rows can use a combination of theads and ths - want to detect the different combinations
  const isHeaderRow = row.section === 'thead';
  const isHeaderCells = Optionals.is(findCommonCellType(row.cells), 'th');
  if (row.section === 'tfoot') {
    return { type: 'footer' };
  } else if (isHeaderRow || isHeaderCells) {
    return { type: 'header', subType: getRowHeaderType(isHeaderRow, isHeaderCells) };
  } else {
    return { type: 'body' };
  }
};

const findCommonCellType = (cells: CommonCellDetails[]): Optional<'td' | 'th'> => {
  const headerCells = Arr.filter(cells, (cell) => isHeaderCell(cell.element));
  if (headerCells.length === 0) {
    return Optional.some('td');
  } else if (headerCells.length === cells.length) {
    return Optional.some('th');
  } else {
    return Optional.none();
  }
};

const findCommonRowType = (rows: CommonRowDetails[]): Optional<RowType> => {
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
  findTableRowHeaderType,
  isHeaderCell,
  isHeaderCells
};
