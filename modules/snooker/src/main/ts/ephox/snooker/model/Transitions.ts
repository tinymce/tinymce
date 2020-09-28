import { Arr, Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { Generators } from '../api/Generators';
import * as Structs from '../api/Structs';
import { Warehouse } from '../api/Warehouse';
import * as TableGrid from './TableGrid';

const toDetails = (grid: Structs.RowCells[], comparator: (a: SugarElement, b: SugarElement) => boolean) => {
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
        return [] as Structs.DetailNew[];
      }
    });
    return Structs.rowdetails(details, row.section);
  });
};

const toGrid = (warehouse: Warehouse, generators: Generators, isNew: boolean) => {
  const grid: Structs.RowCells[] = [];

  if (Warehouse.hasColumns(warehouse)) {
    const groupElementNew = Arr.map(Warehouse.justColumns(warehouse), (column: Structs.Column): Structs.ElementNew =>
      Structs.elementnew(column.element, isNew)
    );

    grid.push(Structs.rowcells(groupElementNew, 'colgroup'));
  }

  for (let rowIndex = 0; rowIndex < warehouse.grid.rows; rowIndex++) {
    const rowCells: Structs.ElementNew[] = [];
    for (let columnIndex = 0; columnIndex < warehouse.grid.columns; columnIndex++) {
      // The element is going to be the element at that position, or a newly generated gap.
      const element = Warehouse.getAt(warehouse, rowIndex, columnIndex).map((item) =>
        Structs.elementnew(item.element, isNew)
      ).getOrThunk(() =>
        Structs.elementnew(generators.gap(), true)
      );
      rowCells.push(element);
    }
    const row = Structs.rowcells(rowCells, warehouse.all[rowIndex].section);
    grid.push(row);
  }

  return grid;
};

export {
  toDetails,
  toGrid
};
