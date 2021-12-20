import { Optional } from '@ephox/katamari';
import { Compare, SugarElement } from '@ephox/sugar';

import * as Structs from '../api/Structs';
import { Warehouse } from '../api/Warehouse';
import * as CellBounds from './CellBounds';

const getBounds = (detailA: Structs.DetailExt, detailB: Structs.DetailExt): Structs.Bounds => {
  return Structs.bounds(
    Math.min(detailA.row, detailB.row),
    Math.min(detailA.column, detailB.column),
    Math.max(detailA.row + detailA.rowspan - 1, detailB.row + detailB.rowspan - 1),
    Math.max(detailA.column + detailA.colspan - 1, detailB.column + detailB.colspan - 1)
  );
};

const getAnyBox = (warehouse: Warehouse, startCell: SugarElement<HTMLTableCellElement>, finishCell: SugarElement<HTMLTableCellElement>): Optional<Structs.Bounds> => {
  const startCoords = Warehouse.findItem(warehouse, startCell, Compare.eq);
  const finishCoords = Warehouse.findItem(warehouse, finishCell, Compare.eq);
  return startCoords.bind((sc) => {
    return finishCoords.map((fc) => {
      return getBounds(sc, fc);
    });
  });
};

const getBox = (warehouse: Warehouse, startCell: SugarElement<HTMLTableCellElement>, finishCell: SugarElement<HTMLTableCellElement>): Optional<Structs.Bounds> => {
  return getAnyBox(warehouse, startCell, finishCell).bind((bounds) => {
    return CellBounds.isRectangular(warehouse, bounds);
  });
};

export {
  getAnyBox,
  getBox
};
