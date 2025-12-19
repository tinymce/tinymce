import { Fun, type Optional } from '@ephox/katamari';

import type { AllowedOverflow, Anchor, CssPosition, CssSize, Position, Shift } from './types';

const getTransform = (shift: Shift): string => `translate3d(${shift.x}px, ${shift.y}px, 0px)`;

const normalizePosition = (position: CssPosition | Position): CssPosition => ({
  x: typeof position.x === 'number' ? `${position.x}px` : position.x,
  y: typeof position.y === 'number' ? `${position.y}px` : position.y
});

const getPosition = (position: CssPosition, allowedOverflow: AllowedOverflow, anchor: Anchor, size: Optional<CssSize>) => {
  const { x, y } = size.fold(
    Fun.constant(position),
    ({ width, height }) => ({
      x: `min(${position.x}, calc(100% - (${width} * ${1 - allowedOverflow.horizontal}))`,
      y: `min(${position.y}, calc(100% - (${height} * ${1 - allowedOverflow.vertical}))`
    })
  );

  if (anchor === 'top-left') {
    return { top: y, left: x };
  }
  if (anchor === 'top-right') {
    return { top: y, right: x };
  }
  if (anchor === 'bottom-left') {
    return { bottom: y, left: x };
  }
  return { bottom: y, right: x };
};

const getPositioningStyles = (shift: Shift, position: CssPosition | Position, anchor: Anchor, allowedOverflow: AllowedOverflow, isDragging: boolean, declaredSize: Optional<CssSize>): React.CSSProperties =>
  isDragging ?
    { transform: getTransform(shift), ...getPosition(normalizePosition(position), allowedOverflow, anchor, declaredSize) }
    : getPosition(normalizePosition(position), allowedOverflow, anchor, declaredSize);

export { getPositioningStyles };
