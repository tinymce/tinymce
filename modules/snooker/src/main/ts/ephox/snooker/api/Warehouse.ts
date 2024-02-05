import { Arr, Obj, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Structs from '../api/Structs';
import * as DetailsList from '../model/DetailsList';
import * as LockedColumnUtils from '../util/LockedColumnUtils';
import { CompElm } from '../util/TableTypes';
import * as TableLookup from './TableLookup';

export interface Warehouse {
  readonly grid: Structs.Grid;
  readonly access: Record<string, Structs.DetailExt>;
  readonly all: Structs.RowDetail<Structs.DetailExt, HTMLTableRowElement>[];
  readonly columns: Record<number, Structs.ColumnExt>;
  readonly colgroups: Structs.Colgroup<Structs.ColumnExt>[];
}

const key = (row: number, column: number): string => {
  return row + ',' + column;
};

const getAt = (warehouse: Warehouse, row: number, column: number): Optional<Structs.DetailExt> =>
  Optional.from(warehouse.access[key(row, column)]);

const findItem = (warehouse: Warehouse, item: SugarElement<HTMLTableCellElement>, comparator: CompElm): Optional<Structs.DetailExt> => {
  const filtered = filterItems(warehouse, (detail) => {
    return comparator(item, detail.element);
  });

  return filtered.length > 0 ? Optional.some(filtered[0]) : Optional.none();
};

const filterItems = (warehouse: Warehouse, predicate: (x: Structs.DetailExt, i: number) => boolean): Structs.DetailExt[] => {
  const all = Arr.bind(warehouse.all, (r) => {
    return r.cells;
  });
  return Arr.filter(all, predicate);
};

const generateColumns = (rowData: Structs.RowDetail<Structs.Detail<HTMLTableColElement>, HTMLTableColElement>): Record<number, Structs.ColumnExt> => {
  const columnsGroup: Record<number, Structs.ColumnExt> = {};
  let index = 0;

  Arr.each(rowData.cells, (column) => {
    const colspan = column.colspan;

    Arr.range(colspan, (columnIndex) => {
      const colIndex = index + columnIndex;
      columnsGroup[colIndex] = Structs.columnext(column.element, colspan, colIndex);
    });

    index += colspan;
  });

  return columnsGroup;
};

/*
 * From a list of list of Detail, generate three pieces of information:
 *  1. the grid size
 *  2. a data structure which can efficiently identify which cell is in which row,column position
 *  3. a list of all cells in order left-to-right, top-to-bottom
 */
const generate = (list: Structs.RowDetail<Structs.Detail>[]): Warehouse => {
  // list is an array of objects, made by cells and elements
  // elements: is the TR
  // cells: is an array of objects representing the cells in the row.
  //        It is made of:
  //          colspan (merge cell)
  //          element
  //          rowspan (merge cols)
  const access: Record<string, Structs.DetailExt> = {};
  const cells: Structs.RowDetail<Structs.DetailExt, HTMLTableRowElement>[] = [];

  const tableOpt = Arr.head(list).map((rowData) => rowData.element).bind(TableLookup.table);
  const lockedColumns: Record<string, true> = tableOpt.bind(LockedColumnUtils.getLockedColumnsFromTable).getOr({});

  let maxRows = 0;
  let maxColumns = 0;
  let rowCount = 0;

  const { pass: colgroupRows, fail: rows } = Arr.partition(list, (rowData) => rowData.section === 'colgroup');

  // Handle rows first
  Arr.each(rows as Array<Structs.RowDetail<Structs.Detail<HTMLTableCellElement>, HTMLTableRowElement>>, (rowData) => {
    const currentRow: Structs.DetailExt[] = [];
    Arr.each(rowData.cells, (rowCell) => {
      let start = 0;

      // If this spot has been taken by a previous rowspan, skip it.
      while (access[key(rowCount, start)] !== undefined) {
        start++;
      }

      const isLocked = Obj.hasNonNullableKey(lockedColumns, start.toString());
      const current = Structs.extended(rowCell.element, rowCell.rowspan, rowCell.colspan, rowCount, start, isLocked);

      // Occupy all the (row, column) positions that this cell spans for.
      for (let occupiedColumnPosition = 0; occupiedColumnPosition < rowCell.colspan; occupiedColumnPosition++) {
        for (let occupiedRowPosition = 0; occupiedRowPosition < rowCell.rowspan; occupiedRowPosition++) {
          const rowPosition = rowCount + occupiedRowPosition;
          const columnPosition = start + occupiedColumnPosition;
          const newpos = key(rowPosition, columnPosition);
          access[newpos] = current;
          maxColumns = Math.max(maxColumns, columnPosition + 1);
        }
      }

      currentRow.push(current);
    });

    maxRows++;
    cells.push(Structs.rowdetail(rowData.element, currentRow, rowData.section));
    rowCount++;
  });

  // Handle colgroups
  // Note: Currently only a single colgroup is supported so just use the last one
  const { columns, colgroups } = Arr.last(colgroupRows as Array<Structs.RowDetail<Structs.Detail<HTMLTableColElement>, HTMLTableColElement>>).map((rowData) => {
    const columns = generateColumns(rowData);
    const colgroup = Structs.colgroup(rowData.element, Obj.values(columns));
    return {
      colgroups: [ colgroup ],
      columns
    };
  }).getOrThunk(() => ({
    colgroups: [],
    columns: {}
  }));

  const grid = Structs.grid(maxRows, maxColumns);

  return {
    grid,
    access,
    all: cells,
    columns,
    colgroups
  };
};

const fromTable = (table: SugarElement<HTMLTableElement>): Warehouse => {
  const list = DetailsList.fromTable(table);
  return generate(list);
};

const justCells = (warehouse: Warehouse): Structs.DetailExt[] =>
  Arr.bind(warehouse.all, (w) => w.cells);

const justColumns = (warehouse: Warehouse): Structs.ColumnExt[] =>
  Obj.values(warehouse.columns);

const hasColumns = (warehouse: Warehouse): boolean =>
  Obj.keys(warehouse.columns).length > 0;

const getColumnAt = (warehouse: Warehouse, columnIndex: number): Optional<Structs.ColumnExt> =>
  Optional.from(warehouse.columns[columnIndex]);

export const Warehouse = {
  fromTable,
  generate,
  getAt,
  findItem,
  filterItems,
  justCells,
  justColumns,
  hasColumns,
  getColumnAt
};
