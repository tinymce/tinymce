import { Fun } from '@ephox/katamari';
import { Replication, SugarElement, SugarNode } from '@ephox/sugar';

import { findTableRowHeaderType, RowHeaderType } from '../lookup/Type';
import { CompElm, Subst } from '../util/TableTypes';
import * as Structs from './Structs';
import { Warehouse } from './Warehouse';

export interface TableSection {
  readonly transformRow: (row: Structs.RowCells<HTMLTableRowElement>, section: Structs.Section) => Structs.RowCells<HTMLTableRowElement>;
  readonly transformCell: (cell: Structs.ElementNew<HTMLTableCellElement>, comparator: CompElm, substitution: Subst) => Structs.ElementNew<HTMLTableCellElement>;
}

const transformCell = (cell: Structs.ElementNew<HTMLTableCellElement>, comparator: CompElm, substitution: Subst) =>
  Structs.elementnew(substitution(cell.element, comparator), true, cell.isLocked);

const transformRow = (row: Structs.RowCells<HTMLTableRowElement>, section: Structs.Section) =>
  row.section !== section ? Structs.rowcells(row.element, row.cells, section, row.isNew) : row;

const section = (): TableSection => ({
  transformRow,
  transformCell: (cell: Structs.ElementNew<HTMLTableCellElement>, comparator: CompElm, substitution: Subst) => {
    const newCell = substitution(cell.element, comparator);
    // Convert the cell to a td element as "section" should always use td element
    const fixedCell = SugarNode.name(newCell) !== 'td' ? Replication.mutate(newCell, 'td') : newCell;
    return Structs.elementnew(fixedCell, cell.isNew, cell.isLocked);
  }
});

const sectionCells = (): TableSection => ({
  transformRow,
  transformCell
});

const cells = (): TableSection => ({
  transformRow: (row: Structs.RowCells<HTMLTableRowElement>, section: Structs.Section) => {
    // Ensure that cells are always within the tbody for headers
    const newSection = section === 'thead' ? 'tbody' : section;
    return transformRow(row, newSection);
  },
  transformCell
});

// A fallback legacy type that won't adjust the row/section type
// and instead will only modify cells
const fallback = (): TableSection => ({
  transformRow: Fun.identity,
  transformCell
});

const getTableSectionType = (table: SugarElement<HTMLTableElement>, fallback: RowHeaderType): TableSection => {
  const warehouse = Warehouse.fromTable(table);
  const type = findTableRowHeaderType(warehouse).getOr(fallback);
  switch (type) {
    case 'section':
      return section();
    case 'sectionCells':
      return sectionCells();
    case 'cells':
      return cells();
  }
};

export const TableSection = {
  getTableSectionType,
  section,
  sectionCells,
  cells,
  fallback
};
