import { Fun, Optional } from '@ephox/katamari';

import { Bounds, DetailExt } from '../api/Structs';
import { Warehouse } from '../api/Warehouse';

const inSelection = (bounds: Bounds, detail: DetailExt): boolean => {
  const leftEdge = detail.column;
  const rightEdge = detail.column + detail.colspan - 1;
  const topEdge = detail.row;
  const bottomEdge = detail.row + detail.rowspan - 1;
  return (
    leftEdge <= bounds.finishCol && rightEdge >= bounds.startCol
  ) && (
    topEdge <= bounds.finishRow && bottomEdge >= bounds.startRow
  );
};

// Note, something is *within* if it is completely contained within the bounds.
const isWithin = (bounds: Bounds, detail: DetailExt): boolean => {
  return (
    detail.column >= bounds.startCol &&
    (detail.column + detail.colspan - 1) <= bounds.finishCol &&
    detail.row >= bounds.startRow &&
    (detail.row + detail.rowspan - 1) <= bounds.finishRow
  );
};

const isRectangular = (warehouse: Warehouse, bounds: Bounds): Optional<Bounds> => {
  let isRect = true;
  const detailIsWithin = Fun.curry(isWithin, bounds);

  for (let i = bounds.startRow; i <= bounds.finishRow; i++) {
    for (let j = bounds.startCol; j <= bounds.finishCol; j++) {
      isRect = isRect && Warehouse.getAt(warehouse, i, j).exists(detailIsWithin);
    }
  }

  return isRect ? Optional.some(bounds) : Optional.none<Bounds>();
};

export {
  inSelection,
  isWithin,
  isRectangular
};
