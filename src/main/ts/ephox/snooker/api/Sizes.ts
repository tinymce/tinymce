import { Arr, Fun } from '@ephox/katamari';
import { Css, Height, Width } from '@ephox/sugar';
import DetailsList from '../model/DetailsList';
import Warehouse from '../model/Warehouse';
import BarPositions from '../resize/BarPositions';
import ColumnSizes from '../resize/ColumnSizes';
import Redistribution from '../resize/Redistribution';
import CellUtils from '../util/CellUtils';

const redistributeToW = function (newWidths, cells, unit) {
  Arr.each(cells, function (cell) {
    const widths = newWidths.slice(cell.column(), cell.colspan() + cell.column());
    const w = Redistribution.sum(widths, CellUtils.minWidth());
    Css.set(cell.element(), 'width', w + unit);
  });
};

const redistributeToH = function (newHeights, rows, cells, unit) {
  Arr.each(cells, function (cell) {
    const heights = newHeights.slice(cell.row(), cell.rowspan() + cell.row());
    const h = Redistribution.sum(heights, CellUtils.minHeight());
    Css.set(cell.element(), 'height', h + unit);
  });

  Arr.each(rows, function (row, i) {
    Css.set(row.element(), 'height', newHeights[i]);
  });
};

const getUnit = function (newSize) {
  return Redistribution.validate(newSize).fold(Fun.constant('px'), Fun.constant('px'), Fun.constant('%'));
};

// Procedure to resize table dimensions to optWidth x optHeight and redistribute cell and row dimensions.
// Updates CSS of the table, rows, and cells.
const redistribute = function (table, optWidth, optHeight, direction) {
  const list = DetailsList.fromTable(table);
  const warehouse = Warehouse.generate(list);
  const rows = warehouse.all();
  const cells = Warehouse.justCells(warehouse);

  optWidth.each(function (newWidth) {
    const wUnit = getUnit(newWidth);
    const totalWidth = Width.get(table);
    const oldWidths = ColumnSizes.getRawWidths(warehouse, direction);
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