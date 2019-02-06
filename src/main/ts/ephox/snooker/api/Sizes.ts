import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import DetailsList from '../model/DetailsList';
import Warehouse from '../model/Warehouse';
import BarPositions from '../resize/BarPositions';
import ColumnSizes from '../resize/ColumnSizes';
import Redistribution from '../resize/Redistribution';
import CellUtils from '../util/CellUtils';
import { Css } from '@ephox/sugar';
import { Height } from '@ephox/sugar';
import { Width } from '@ephox/sugar';

var redistributeToW = function (newWidths, cells, unit) {
  Arr.each(cells, function (cell) {
    var widths = newWidths.slice(cell.column(), cell.colspan() + cell.column());
    var w = Redistribution.sum(widths, CellUtils.minWidth());
    Css.set(cell.element(), 'width', w + unit);
  });
};

var redistributeToH = function (newHeights, rows, cells, unit) {
  Arr.each(cells, function (cell) {
    var heights = newHeights.slice(cell.row(), cell.rowspan() + cell.row());
    var h = Redistribution.sum(heights, CellUtils.minHeight());
    Css.set(cell.element(), 'height', h + unit);
  });

  Arr.each(rows, function (row, i) {
    Css.set(row.element(), 'height', newHeights[i]);
  });
};

var getUnit = function (newSize) {
  return Redistribution.validate(newSize).fold(Fun.constant('px'), Fun.constant('px'), Fun.constant('%'));
};

// Procedure to resize table dimensions to optWidth x optHeight and redistribute cell and row dimensions.
// Updates CSS of the table, rows, and cells.
var redistribute = function (table, optWidth, optHeight, direction) {
  var list = DetailsList.fromTable(table);
  var warehouse = Warehouse.generate(list);
  var rows = warehouse.all();
  var cells = Warehouse.justCells(warehouse);

  optWidth.each(function (newWidth) {
    var wUnit = getUnit(newWidth);
    var totalWidth = Width.get(table);
    var oldWidths = ColumnSizes.getRawWidths(warehouse, direction);
    var nuWidths = Redistribution.redistribute(oldWidths, totalWidth, newWidth);
    redistributeToW(nuWidths, cells, wUnit);
    Css.set(table, 'width', newWidth);
  });

  optHeight.each(function (newHeight) {
    var hUnit = getUnit(newHeight);
    var totalHeight = Height.get(table);
    var oldHeights = ColumnSizes.getRawHeights(warehouse, BarPositions.height);
    var nuHeights = Redistribution.redistribute(oldHeights, totalHeight, newHeight);
    redistributeToH(nuHeights, rows, cells, hUnit);
    Css.set(table, 'height', newHeight);
  });

};

export default {
  redistribute: redistribute
};