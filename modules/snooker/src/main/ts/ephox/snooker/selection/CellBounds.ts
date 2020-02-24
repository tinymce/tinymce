import { Fun, Option } from '@ephox/katamari';
import { Warehouse } from '../model/Warehouse';
import { Bounds, DetailExt } from '../api/Structs';

const inSelection = function (bounds: Bounds, detail: DetailExt) {
  const leftEdge = detail.column();
  const rightEdge = detail.column() + detail.colspan() - 1;
  const topEdge = detail.row();
  const bottomEdge = detail.row() + detail.rowspan() - 1;
  return (
    leftEdge <= bounds.finishCol() && rightEdge >= bounds.startCol()
  ) && (
    topEdge <= bounds.finishRow() && bottomEdge >= bounds.startRow()
  );
};

// Note, something is *within* if it is completely contained within the bounds.
const isWithin = function (bounds: Bounds, detail: DetailExt) {
  return (
    detail.column() >= bounds.startCol() &&
    (detail.column() + detail.colspan() - 1) <= bounds.finishCol() &&
    detail.row() >= bounds.startRow() &&
    (detail.row() + detail.rowspan() - 1) <= bounds.finishRow()
  );
};

const isRectangular = function (warehouse: Warehouse, bounds: Bounds) {
  let isRect = true;
  const detailIsWithin = Fun.curry(isWithin, bounds);

  for (let i = bounds.startRow(); i <= bounds.finishRow(); i++) {
    for (let j = bounds.startCol(); j <= bounds.finishCol(); j++) {
      isRect = isRect && Warehouse.getAt(warehouse, i, j).exists(detailIsWithin);
    }
  }

  return isRect ? Option.some(bounds) : Option.none<Bounds>();
};

export {
  inSelection,
  isWithin,
  isRectangular
};
