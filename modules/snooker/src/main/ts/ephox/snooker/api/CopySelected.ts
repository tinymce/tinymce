import { Arr, Obj, Optional } from '@ephox/katamari';
import { Attribute, Insert, Remove, Replication, Selectors, SugarElement, Width } from '@ephox/sugar';
import * as DetailsList from '../model/DetailsList';
import * as LayerSelector from '../util/LayerSelector';
import { DetailExt, RowData } from './Structs';
import { getUniqueColumns } from './TableOperations';
import { TableSize } from './TableSize';
import { Warehouse } from './Warehouse';

interface StatsStruct {
  readonly minRow: number;
  readonly minCol: number;
  readonly maxRow: number;
  readonly maxCol: number;
  readonly selectedCells: DetailExt[];
}

const statsStruct = (minRow: number, minCol: number, maxRow: number, maxCol: number, selectedCells: DetailExt[]): StatsStruct => ({
  minRow,
  minCol,
  maxRow,
  maxCol,
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
  const selectedCells: any[] = [];
  Obj.each(house.access, (detail) => {
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
  return statsStruct(minRow, minCol, maxRow, maxCol, selectedCells);
};

const makeCell = <T>(list: RowData<T>[], seenSelected: boolean, rowIndex: number): void => {
  // no need to check bounds, as anything outside this index is removed in the nested for loop
  const row = list[rowIndex].element;
  const td = SugarElement.fromTag('td');
  Insert.append(td, SugarElement.fromTag('br'));
  const f = seenSelected ? Insert.append : Insert.prepend;
  f(row, td);
};

const fillInGaps = <T>(list: RowData<T>[], house: Warehouse, stats: StatsStruct, isSelected: (detail: DetailExt) => boolean) => {
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
          makeCell(list, seenSelected, i);
        } else {
          seenSelected = true;
        }
      }
    }
  }
};

const clean = (replica: SugarElement<HTMLTableElement>, stats: StatsStruct, widthOpt: Optional<number>): void => {
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

  widthOpt.each((width) => {
    const tableSize = TableSize.getTableSize(replica);
    tableSize.adjustTableWidth(width);
  });
};

const getNewTableWidth = (tableSize: TableSize, stats: StatsStruct): Optional<number> => {
  const uniqueCols = getUniqueColumns(stats.selectedCells);

  const selectedColsWidth = uniqueCols.reduce((acc, col) => {
    return acc + Width.getOuter(col.element);
  }, 0);

  switch (tableSize.label) {
    case 'none':
      return Optional.none();
    case 'pixel':
      return Optional.some(selectedColsWidth - tableSize.pixelWidth());
    case 'percent':
      return Optional.some(selectedColsWidth / tableSize.pixelWidth());
  }
};

const extract = (table: SugarElement, selectedSelector: string): SugarElement => {
  const isSelected = (detail: DetailExt) => Selectors.is(detail.element, selectedSelector);

  const list = DetailsList.fromTable(table);
  const house = Warehouse.generate(list);
  const tableSize = TableSize.getTableSize(table);
  const stats = findSelectedStats(house, isSelected);

  const replica = Replication.deep(table);
  // remove unselected cells
  const selector = 'th:not(' + selectedSelector + ')' + ',td:not(' + selectedSelector + ')';
  const unselectedCells = LayerSelector.filterFirstLayer(replica, 'th,td', (cell) => Selectors.is(cell, selector));
  Arr.each(unselectedCells, Remove.remove);

  fillInGaps(list, house, stats, isSelected);

  const widthOpt = getNewTableWidth(tableSize, stats);
  clean(replica, stats, widthOpt);

  return replica;
};

export {
  extract
};
