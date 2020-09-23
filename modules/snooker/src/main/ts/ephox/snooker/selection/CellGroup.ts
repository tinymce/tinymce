import { Compare, SugarElement } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import { Warehouse } from '../api/Warehouse';
import * as CellBounds from './CellBounds';

const getBounds = function (detailA: Structs.DetailExt, detailB: Structs.DetailExt) {
  return Structs.bounds(
    Math.min(detailA.row, detailB.row),
    Math.min(detailA.column, detailB.column),
    Math.max(detailA.row + detailA.rowspan - 1, detailB.row + detailB.rowspan - 1),
    Math.max(detailA.column + detailA.colspan - 1, detailB.column + detailB.colspan - 1)
  );
};

const getAnyBox = function (warehouse: Warehouse, startCell: SugarElement, finishCell: SugarElement) {
  const startCoords = Warehouse.findItem(warehouse, startCell, Compare.eq);
  const finishCoords = Warehouse.findItem(warehouse, finishCell, Compare.eq);
  return startCoords.bind(function (sc) {
    return finishCoords.map(function (fc) {
      return getBounds(sc, fc);
    });
  });
};

const getBox = function (warehouse: Warehouse, startCell: SugarElement, finishCell: SugarElement) {
  return getAnyBox(warehouse, startCell, finishCell).bind(function (bounds: Structs.Bounds) {
    return CellBounds.isRectangular(warehouse, bounds);
  });
};

export {
  getAnyBox,
  getBox
};
