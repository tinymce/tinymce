import { Arr, Fun, Option } from '@ephox/katamari';
import { Css, Height, Width, Element } from '@ephox/sugar';
import DetailsList from '../model/DetailsList';
import { Warehouse } from '../model/Warehouse';
import { BarPositions, ColInfo } from '../resize/BarPositions';
import ColumnSizes from '../resize/ColumnSizes';
import Redistribution from '../resize/Redistribution';
import CellUtils from '../util/CellUtils';
import TableSize from '../resize/TableSize';
import { DetailExt, RowData } from './Structs';

const redistributeToW = function (newWidths: string[], cells: DetailExt[], unit: string) {
  Arr.each(cells, function (cell) {
    const widths = newWidths.slice(cell.column(), cell.colspan() + cell.column());
    const w = Redistribution.sum(widths, CellUtils.minWidth());
    Css.set(cell.element(), 'width', w + unit);
  });
};

const redistributeToH = function <T> (newHeights: string[], rows: RowData<T>[], cells: DetailExt[], unit: string) {
  Arr.each(cells, function (cell) {
    const heights = newHeights.slice(cell.row(), cell.rowspan() + cell.row());
    const h = Redistribution.sum(heights, CellUtils.minHeight());
    Css.set(cell.element(), 'height', h + unit);
  });

  Arr.each(rows, function (row, i) {
    Css.set(row.element(), 'height', newHeights[i]);
  });
};

const getUnit = function (newSize: string) {
  return Redistribution.validate(newSize).fold(Fun.constant('px'), Fun.constant('px'), Fun.constant('%'));
};

// Procedure to resize table dimensions to optWidth x optHeight and redistribute cell and row dimensions.
// Updates CSS of the table, rows, and cells.
const redistribute = function (table: Element, optWidth: Option<string>, optHeight: Option<string>, direction: BarPositions<ColInfo>) {
  const list = DetailsList.fromTable(table);
  const warehouse = Warehouse.generate(list);
  const rows = warehouse.all();
  const cells = Warehouse.justCells(warehouse);
  const tableSize = TableSize.getTableSize(table);

  optWidth.each(function (newWidth) {
    const wUnit = getUnit(newWidth);
    const totalWidth = Width.get(table);
    const oldWidths = ColumnSizes.getRawWidths(warehouse, direction, tableSize);
    const nuWidths = Redistribution.redistribute(oldWidths, totalWidth, newWidth);
    redistributeToW(nuWidths, cells, wUnit);
    Css.set(table, 'width', newWidth);
  });

  optHeight.each(function (newHeight) {
    const hUnit = getUnit(newHeight);
    const totalHeight = Height.get(table);
    const oldHeights = ColumnSizes.getRawHeights(warehouse, BarPositions.height);
    const nuHeights = Redistribution.redistribute(oldHeights, totalHeight, newHeight);
    redistributeToH(nuHeights, rows, cells, hUnit);
    Css.set(table, 'height', newHeight);
  });

};

export default {
  redistribute
};