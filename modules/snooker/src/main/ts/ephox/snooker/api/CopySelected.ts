import { Arr, Obj } from '@ephox/katamari';
import { Attribute, Insert, Remove, Replication, Selectors, SugarElement } from '@ephox/sugar';

import * as DetailsList from '../model/DetailsList';
import * as ColumnSizes from '../resize/ColumnSizes';
import * as LayerSelector from '../util/LayerSelector';
import { LOCKED_COL_ATTR } from '../util/LockedColumnUtils';
import { Detail, DetailExt, RowDetail } from './Structs';
import { TableSize } from './TableSize';
import { Warehouse } from './Warehouse';

type CellRowDetail = RowDetail<Detail<HTMLTableCellElement>, HTMLTableRowElement>;

interface StatsStruct {
  readonly minRow: number;
  readonly minCol: number;
  readonly maxRow: number;
  readonly maxCol: number;
  readonly allCells: DetailExt[];
  readonly selectedCells: DetailExt[];
}

const statsStruct = (minRow: number, minCol: number, maxRow: number, maxCol: number, allCells: DetailExt[], selectedCells: DetailExt[]): StatsStruct => ({
  minRow,
  minCol,
  maxRow,
  maxCol,
  allCells,
  selectedCells,
});

const findSelectedStats = (house: Warehouse, isSelected: (detail: DetailExt) => boolean): StatsStruct => {
  const totalColumns = house.grid.columns;
  const totalRows = house.grid.rows;

  /* Refactor into a method returning a struct to hide the mutation */
  let minRow = totalRows;
  let minCol = totalColumns;
  let maxRow = 0;
  let maxCol = 0;
  const allCells: DetailExt[] = [];
  const selectedCells: DetailExt[] = [];
  Obj.each(house.access, (detail) => {
    allCells.push(detail);
    if (isSelected(detail)) {
      selectedCells.push(detail);
      const startRow = detail.row;
      const endRow = startRow + detail.rowspan - 1;
      const startCol = detail.column;
      const endCol = startCol + detail.colspan - 1;
      if (startRow < minRow) {
        minRow = startRow;
      } else if (endRow > maxRow) {
        maxRow = endRow;
      }

      if (startCol < minCol) {
        minCol = startCol;
      } else if (endCol > maxCol) {
        maxCol = endCol;
      }
    }
  });
  return statsStruct(minRow, minCol, maxRow, maxCol, allCells, selectedCells);
};

const makeCell = (list: CellRowDetail[], seenSelected: boolean, rowIndex: number): void => {
  // no need to check bounds, as anything outside this index is removed in the nested for loop
  const row = list[rowIndex].element;
  const td = SugarElement.fromTag('td');
  Insert.append(td, SugarElement.fromTag('br'));
  const f = seenSelected ? Insert.append : Insert.prepend;
  f(row, td);
};

const fillInGaps = (list: RowDetail<Detail>[], house: Warehouse, stats: StatsStruct, isSelected: (detail: DetailExt) => boolean) => {
  const rows = Arr.filter(list, (row): row is CellRowDetail => row.section !== 'colgroup');
  const totalColumns = house.grid.columns;
  const totalRows = house.grid.rows;
  // unselected cells have been deleted, now fill in the gaps in the model
  for (let i = 0; i < totalRows; i++) {
    let seenSelected = false;
    for (let j = 0; j < totalColumns; j++) {
      if (!(i < stats.minRow || i > stats.maxRow || j < stats.minCol || j > stats.maxCol)) {
        // if there is a hole in the table itself, or it's an unselected position, we need a cell
        const needCell = Warehouse.getAt(house, i, j).filter(isSelected).isNone();
        if (needCell) {
          makeCell(rows, seenSelected, i);
        } else {
          seenSelected = true;
        }
      }
    }
  }
};

const clean = (replica: SugarElement<HTMLTableElement>, stats: StatsStruct, house: Warehouse, widthDelta: number): void => {
  // remove columns that are not in the new table
  Obj.each(house.columns, (col) => {
    if (col.column < stats.minCol || col.column > stats.maxCol) {
      Remove.remove(col.element);
    }
  });

  // can't use :empty selector as that will not include TRs made up of whitespace
  const emptyRows = Arr.filter(LayerSelector.firstLayer(replica, 'tr'), (row) =>
    // there is no sugar method for this, and Traverse.children() does too much processing
    (row.dom as HTMLElement).childElementCount === 0
  );
  Arr.each(emptyRows, Remove.remove);

  // If there is only one column, or only one row, delete all the colspan/rowspan
  if (stats.minCol === stats.maxCol || stats.minRow === stats.maxRow) {
    Arr.each(LayerSelector.firstLayer(replica, 'th,td'), (cell) => {
      Attribute.remove(cell, 'rowspan');
      Attribute.remove(cell, 'colspan');
    });
  }
  // Remove any attributes that should not be in the replicated table
  Attribute.remove(replica, LOCKED_COL_ATTR);
  // TODO: TINY-6944 - need to figure out a better way of handling this
  Attribute.remove(replica, 'data-snooker-col-series'); // For advtable series column feature

  const tableSize = TableSize.getTableSize(replica);
  tableSize.adjustTableWidth(widthDelta);

  // TODO TINY-6863: If using relative widths, ensure cell and column widths are redistributed
};

const getTableWidthDelta = (table: SugarElement<HTMLTableElement>, warehouse: Warehouse, tableSize: TableSize, stats: StatsStruct): number => {
  // short circuit entire table selected
  if (stats.minCol === 0 && warehouse.grid.columns === stats.maxCol + 1) {
    return 0;
  }

  const colWidths = ColumnSizes.getPixelWidths(warehouse, table, tableSize);
  const allColsWidth = Arr.foldl(colWidths, (acc, width) => acc + width, 0);
  const selectedColsWidth = Arr.foldl(colWidths.slice(stats.minCol, stats.maxCol + 1), (acc, width) => acc + width, 0);
  const newWidth = (selectedColsWidth / allColsWidth) * tableSize.pixelWidth();
  const delta = newWidth - tableSize.pixelWidth();

  return tableSize.getCellDelta(delta);
};

const extract = (table: SugarElement<HTMLTableElement>, selectedSelector: string): SugarElement<HTMLTableElement> => {
  const isSelected = (detail: DetailExt) => Selectors.is(detail.element, selectedSelector);

  const replica = Replication.deep(table);
  const list = DetailsList.fromTable(replica);
  const tableSize = TableSize.getTableSize(table);
  const replicaHouse = Warehouse.generate(list);
  const replicaStats = findSelectedStats(replicaHouse, isSelected);

  // remove unselected cells
  const selector = 'th:not(' + selectedSelector + ')' + ',td:not(' + selectedSelector + ')';
  const unselectedCells = LayerSelector.filterFirstLayer(replica, 'th,td', (cell) => Selectors.is(cell, selector));
  Arr.each(unselectedCells, Remove.remove);

  fillInGaps(list, replicaHouse, replicaStats, isSelected);

  const house = Warehouse.fromTable(table);
  const widthDelta = getTableWidthDelta(table, house, tableSize, replicaStats);
  clean(replica, replicaStats, replicaHouse, widthDelta);

  return replica;
};

export {
  extract
};
