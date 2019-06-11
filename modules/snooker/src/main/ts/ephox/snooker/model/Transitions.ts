import { Arr } from '@ephox/katamari';
import * as Structs from '../api/Structs';
import TableGrid from './TableGrid';
import { Warehouse } from './Warehouse';
import { Generators } from '../api/Generators';
import { Element } from '@ephox/sugar';

const toDetails = function (grid: Structs.RowCells[], comparator: (a: Element, b: Element) => boolean) {
  const seen = Arr.map(grid, function (row, ri) {
    return Arr.map(row.cells(), function (col, ci) {
      return false;
    });
  });

  const updateSeen = function (ri: number, ci: number, rowspan: number, colspan: number) {
    for (let r = ri; r < ri + rowspan; r++) {
      for (let c = ci; c < ci + colspan; c++) {
        seen[r][c] = true;
      }
    }
  };

  return Arr.map(grid, function (row, ri) {
    const details = Arr.bind(row.cells(), function (cell, ci) {
      // if we have seen this one, then skip it.
      if (seen[ri][ci] === false) {
        const result = TableGrid.subgrid(grid, ri, ci, comparator);
        updateSeen(ri, ci, result.rowspan(), result.colspan());
        return [ Structs.detailnew(cell.element(), result.rowspan(), result.colspan(), cell.isNew()) ];
      } else {
        return [] as Structs.DetailNew[];
      }
    });
    return Structs.rowdetails(details, row.section());
  });
};

const toGrid = function (warehouse: Warehouse, generators: Generators, isNew: boolean) {
  const grid: Structs.RowCells[] = [];
  for (let i = 0; i < warehouse.grid().rows(); i++) {
    const rowCells: Structs.ElementNew[] = [];
    for (let j = 0; j < warehouse.grid().columns(); j++) {
      // The element is going to be the element at that position, or a newly generated gap.
      const element = Warehouse.getAt(warehouse, i, j).map(function (item) {
        return Structs.elementnew(item.element(), isNew);
      }).getOrThunk(function () {
        return Structs.elementnew(generators.gap(), true);
      });
      rowCells.push(element);
    }
    const row = Structs.rowcells(rowCells, warehouse.all()[i].section());
    grid.push(row);
  }
  return grid;
};

export default {
  toDetails,
  toGrid
};