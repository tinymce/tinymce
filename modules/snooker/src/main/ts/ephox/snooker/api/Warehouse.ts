import { Arr, Obj, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import * as DetailsList from '../model/DetailsList';

export interface Warehouse {
  readonly grid: Structs.Grid;
  readonly access: Record<string, Structs.DetailExt>;
  readonly all: Structs.RowData<Structs.DetailExt>[];
  readonly columns: Record<string, Structs.ColumnExt>;
}

const key = function (row: number, column: number): string {
  return row + ',' + column;
};

const getAt = function (warehouse: Warehouse, row: number, column: number): Optional<Structs.DetailExt> {
  const raw = warehouse.access[key(row, column)];
  return raw !== undefined ? Optional.some(raw) : Optional.none<Structs.DetailExt>();
};

const findItem = function <T> (warehouse: Warehouse, item: T, comparator: (a: T, b: SugarElement) => boolean): Optional<Structs.DetailExt> {
  const filtered = filterItems(warehouse, function (detail) {
    return comparator(item, detail.element);
  });

  return filtered.length > 0 ? Optional.some(filtered[0]) : Optional.none<Structs.DetailExt>();
};

const filterItems = function (warehouse: Warehouse, predicate: (x: Structs.DetailExt, i: number) => boolean): Structs.DetailExt[] {
  const all = Arr.bind(warehouse.all, function (r) { return r.cells; });
  return Arr.filter(all, predicate);
};

const generateColumns = <T extends Structs.Detail> (rowData: Structs.RowData<T>): Record<number, Structs.ColumnExt> => {
  const columnsGroup: Record<number, Structs.ColumnExt> = {};
  let index = 0;

  Arr.each(rowData.cells, (column: T) => {
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
const generate = <T extends Structs.Detail> (list: Structs.RowData<T>[]): Warehouse => {
  // list is an array of objects, made by cells and elements
  // elements: is the TR
  // cells: is an array of objects representing the cells in the row.
  //        It is made of:
  //          colspan (merge cell)
  //          element
  //          rowspan (merge cols)
  const access: Record<string, Structs.DetailExt> = {};
  const cells: Structs.RowData<Structs.DetailExt>[] = [];
  let columns: Record<number, Structs.ColumnExt> = {};

  let maxRows = 0;
  let maxColumns = 0;
  let rowCount = 0;

  Arr.each(list, (rowData) => {
    if (rowData.section === 'colgroup') {
      columns = generateColumns<T>(rowData);
    } else {
      const currentRow: Structs.DetailExt[] = [];
      Arr.each(rowData.cells, (rowCell) => {
        let start = 0;

        // If this spot has been taken by a previous rowspan, skip it.
        while (access[key(rowCount, start)] !== undefined) {
          start++;
        }

        const current = Structs.extended(rowCell.element, rowCell.rowspan, rowCell.colspan, rowCount, start);

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
      cells.push(Structs.rowdata(rowData.element, currentRow, rowData.section));
      rowCount++;
    }
  });

  const grid = Structs.grid(maxRows, maxColumns);

  return {
    grid,
    access,
    all: cells,
    columns
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
