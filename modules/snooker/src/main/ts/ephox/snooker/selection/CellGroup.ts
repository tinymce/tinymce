import Structs from '../api/Structs';
import Warehouse from '../model/Warehouse';
import CellBounds from './CellBounds';
import { Compare } from '@ephox/sugar';

const getBounds = function (detailA, detailB) {
  return Structs.bounds(
    Math.min(detailA.row(), detailB.row()),
    Math.min(detailA.column(), detailB.column()),
    Math.max(detailA.row() + detailA.rowspan() - 1 , detailB.row() + detailB.rowspan() - 1),
    Math.max(detailA.column() + detailA.colspan() - 1, detailB.column() + detailB.colspan() - 1)
  );
};

const getAnyBox = function (warehouse, startCell, finishCell) {
  const startCoords = Warehouse.findItem(warehouse, startCell, Compare.eq);
  const finishCoords = Warehouse.findItem(warehouse, finishCell, Compare.eq);
  return startCoords.bind(function (sc) {
    return finishCoords.map(function (fc) {
      return getBounds(sc, fc);
    });
  });
};

const getBox = function (warehouse, startCell, finishCell) {
  return getAnyBox(warehouse, startCell, finishCell).bind(function (bounds) {
    return CellBounds.isRectangular(warehouse, bounds);
  });
};

export default {
  getAnyBox,
  getBox
};