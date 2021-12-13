import { Arr, Fun } from '@ephox/katamari';

import { Generators } from '../api/Generators';
import * as Structs from '../api/Structs';
import { Warehouse } from '../api/Warehouse';
import { CompElm, RowCell, RowElement } from '../util/TableTypes';
import * as TableGrid from './TableGrid';

const toDetails = <R extends RowElement>(grid: Structs.RowCells<R>[], comparator: CompElm): Structs.RowDetailNew<Structs.DetailNew<RowCell<R>>, R>[] => {
  const seen: boolean[][] = Arr.map(grid, (row) =>
    Arr.map(row.cells, Fun.never)
  );

  const updateSeen = (rowIndex: number, columnIndex: number, rowspan: number, colspan: number) => {
    for (let row = rowIndex; row < rowIndex + rowspan; row++) {
      for (let column = columnIndex; column < columnIndex + colspan; column++) {
        seen[row][column] = true;
      }
    }
  };

  return Arr.map(grid, (row, rowIndex) => {
    const details = Arr.bind(row.cells, (cell, columnIndex) => {
      // if we have seen this one, then skip it.
      if (seen[rowIndex][columnIndex] === false) {
        const result = TableGrid.subgrid(grid, rowIndex, columnIndex, comparator);
        updateSeen(rowIndex, columnIndex, result.rowspan, result.colspan);
        return [ Structs.detailnew(cell.element, result.rowspan, result.colspan, cell.isNew) ];
      } else {
        return [] as Structs.DetailNew<RowCell<R>>[];
      }
    });
    return Structs.rowdetailnew(row.element, details, row.section, row.isNew);
  });
};

const toGrid = (warehouse: Warehouse, generators: Generators, isNew: boolean): Structs.RowCells[] => {
  const grid: Structs.RowCells[] = [];

  Arr.each(warehouse.colgroups, (colgroup) => {
    const colgroupCols: Structs.ElementNew<HTMLTableColElement>[] = [];
    // This will add missing cols as well as clamp the number of cols to the max number of actual columns
    // Note: Spans on cols are unsupported so clamping cols may result in a span on a col element being incorrect
    for (let columnIndex = 0; columnIndex < warehouse.grid.columns; columnIndex++) {
      const element = Warehouse.getColumnAt(warehouse, columnIndex)
        .map((column) => Structs.elementnew(column.element, isNew, false))
        .getOrThunk(() => Structs.elementnew(generators.colGap(), true, false));
      colgroupCols.push(element);
    }
    grid.push(Structs.rowcells(colgroup.element, colgroupCols, 'colgroup', isNew));
  });

  for (let rowIndex = 0; rowIndex < warehouse.grid.rows; rowIndex++) {
    const rowCells: Structs.ElementNew<HTMLTableCellElement>[] = [];
    for (let columnIndex = 0; columnIndex < warehouse.grid.columns; columnIndex++) {
      // The element is going to be the element at that position, or a newly generated gap.
      const element = Warehouse.getAt(warehouse, rowIndex, columnIndex).map((item) =>
        Structs.elementnew(item.element, isNew, item.isLocked)
      ).getOrThunk(() =>
        Structs.elementnew(generators.gap(), true, false)
      );
      rowCells.push(element);
    }
    const rowDetail = warehouse.all[rowIndex];
    const row = Structs.rowcells(rowDetail.element, rowCells, rowDetail.section, isNew);
    grid.push(row);
  }

  return grid;
};

export {
  toDetails,
  toGrid
};
