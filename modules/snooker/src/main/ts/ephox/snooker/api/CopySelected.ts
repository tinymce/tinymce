import { Arr, Obj } from '@ephox/katamari';
import { Attr, Css, Element, Insert, Remove, Selectors } from '@ephox/sugar';
import * as DetailsList from '../model/DetailsList';
import { Warehouse } from '../model/Warehouse';
import * as LayerSelector from '../util/LayerSelector';
import { DetailExt, RowData } from './Structs';
import { HTMLElement } from '@ephox/dom-globals';

interface StatsStruct {
  readonly minRow: number;
  readonly minCol: number;
  readonly maxRow: number;
  readonly maxCol: number;
}

const statsStruct = (minRow: number, minCol: number, maxRow: number, maxCol: number): StatsStruct => ({
  minRow,
  minCol,
  maxRow,
  maxCol
});

const findSelectedStats = (house: Warehouse, isSelected: (detail: DetailExt) => boolean): StatsStruct => {
  const totalColumns = house.grid.columns();
  const totalRows = house.grid.rows();

  /* Refactor into a method returning a struct to hide the mutation */
  let minRow = totalRows;
  let minCol = totalColumns;
  let maxRow = 0;
  let maxCol = 0;
  Obj.each(house.access, (detail) => {
    if (isSelected(detail)) {
      const startRow = detail.row();
      const endRow = startRow + detail.rowspan() - 1;
      const startCol = detail.column();
      const endCol = startCol + detail.colspan() - 1;
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
  return statsStruct(minRow, minCol, maxRow, maxCol);
};

const makeCell = <T>(list: RowData<T>[], seenSelected: boolean, rowIndex: number): void => {
  // no need to check bounds, as anything outside this index is removed in the nested for loop
  const row = list[rowIndex].element();
  const td = Element.fromTag('td');
  Insert.append(td, Element.fromTag('br'));
  const f = seenSelected ? Insert.append : Insert.prepend;
  f(row, td);
};

const fillInGaps = <T>(list: RowData<T>[], house: Warehouse, stats: StatsStruct, isSelected: (detail: DetailExt) => boolean) => {
  const totalColumns = house.grid.columns();
  const totalRows = house.grid.rows();
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

const clean = (table: Element, stats: StatsStruct): void => {
  // can't use :empty selector as that will not include TRs made up of whitespace
  const emptyRows = Arr.filter(LayerSelector.firstLayer(table, 'tr'), (row) =>
    // there is no sugar method for this, and Traverse.children() does too much processing
    (row.dom() as HTMLElement).childElementCount === 0
  );
  Arr.each(emptyRows, Remove.remove);

  // If there is only one column, or only one row, delete all the colspan/rowspan
  if (stats.minCol === stats.maxCol || stats.minRow === stats.maxRow) {
    Arr.each(LayerSelector.firstLayer(table, 'th,td'), (cell) => {
      Attr.remove(cell, 'rowspan');
      Attr.remove(cell, 'colspan');
    });
  }

  Attr.remove(table, 'width');
  Attr.remove(table, 'height');
  Css.remove(table, 'width');
  Css.remove(table, 'height');
};

const extract = (table: Element, selectedSelector: string): Element => {
  const isSelected = (detail: DetailExt) => Selectors.is(detail.element(), selectedSelector);

  const list = DetailsList.fromTable(table);
  const house = Warehouse.generate(list);

  const stats = findSelectedStats(house, isSelected);

  // remove unselected cells
  const selector = 'th:not(' + selectedSelector + ')' + ',td:not(' + selectedSelector + ')';
  const unselectedCells = LayerSelector.filterFirstLayer(table, 'th,td', (cell) => Selectors.is(cell, selector));
  Arr.each(unselectedCells, Remove.remove);

  fillInGaps(list, house, stats, isSelected);

  clean(table, stats);

  return table;
};

export {
  extract
};
