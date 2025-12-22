import { Fun, type Optional } from '@ephox/katamari';
import type React from 'react';

import type { AllowedOverflow, CssPosition, CssSize, Position, Shift } from './types';

const getTransform = (shift: Shift): string => `translate3d(${shift.x}px, ${shift.y}px, 0px)`;

const normalizePosition = (position: CssPosition | Position): CssPosition =>
  'x' in position ? { top: `${position.y}px`, left: `${position.x}px` } : position;

const getPosition = (position: CssPosition, allowedOverflow: AllowedOverflow, size: Optional<CssSize>) =>
  size.fold(
    Fun.constant(position),
    ({ width, height }) => ({
      top: `min(${position.top}, calc(100% - (${height} * ${1 - allowedOverflow.vertical}))`,
      left: `min(${position.left}, calc(100% - (${width} * ${1 - allowedOverflow.horizontal}))`,
    })
  );

const getPositioningStyles = (shift: Shift, position: CssPosition | Position, allowedOverflow: AllowedOverflow, isDragging: boolean, declaredSize: Optional<CssSize>): React.CSSProperties =>
  isDragging ?
    { transform: getTransform(shift), ...getPosition(normalizePosition(position), allowedOverflow, declaredSize) }
    : getPosition(normalizePosition(position), allowedOverflow, declaredSize);

export { getPositioningStyles };
