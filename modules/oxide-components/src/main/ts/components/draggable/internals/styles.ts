import { Fun, Type, type Optional } from '@ephox/katamari';

import * as OriginPredicates from './OriginPredicates';
import type { AllowedOverflow, Origin, CssPosition, CssSize, Position, Shift } from './types';

const getTransform = (shift: Shift): string => `translate3d(${shift.x}px, ${shift.y}px, 0px)`;

const normalizePosition = (position: CssPosition | Position): CssPosition => ({
  x: Type.isNumber(position.x) ? `${position.x}px` : position.x,
  y: Type.isNumber(position.y) ? `${position.y}px` : position.y
});

const getPosition = (position: CssPosition, allowedOverflow: AllowedOverflow, origin: Origin, size: Optional<CssSize>) => {
  const { x, y } = size.fold(
    Fun.constant(position),
    ({ width, height }) => {
      let x = position.x;
      let y = position.y;
      if (allowedOverflow.horizontal < 1) {
        const elementVisibleWidth = allowedOverflow.horizontal > 0
          ? `${width} * ${(1 - allowedOverflow.horizontal).toFixed(2)}` : width;
        x = `min( ${position.x}, calc( 100% - ${elementVisibleWidth} ) )`;
      }
      if (allowedOverflow.vertical < 1) {
        const elementVisibleHeight = allowedOverflow.vertical > 0
          ? `${height} * ${(1 - allowedOverflow.vertical).toFixed(2)}` : height;
        y = `min( ${position.y}, calc( 100% - ${elementVisibleHeight} ) )`;
      }
      return { x, y };
    }
  );

  if (OriginPredicates.isTopLeft(origin)) {
    return { top: y, left: x };
  }
  if (OriginPredicates.isTopRight(origin)) {
    return { top: y, right: x };
  }
  if (OriginPredicates.isBottomLeft(origin)) {
    return { bottom: y, left: x };
  }
  return { bottom: y, right: x };
};

const getPositioningStyles = (shift: Shift, position: CssPosition | Position, origin: Origin, allowedOverflow: AllowedOverflow, isDragging: boolean, declaredSize: Optional<CssSize>): React.CSSProperties =>
  isDragging ?
    { transform: getTransform(shift), ...getPosition(normalizePosition(position), allowedOverflow, origin, declaredSize) }
    : getPosition(normalizePosition(position), allowedOverflow, origin, declaredSize);

export { getPositioningStyles };
