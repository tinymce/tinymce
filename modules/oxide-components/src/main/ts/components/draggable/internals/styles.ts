import { Fun, type Optional } from '@ephox/katamari';

import type { CssPosition, CssSize, Position, Shift } from './types';

const getTransform = (shift: Shift): string => `translate3d(${shift.x}px, ${shift.y}px, 0px)`;

const normalizePosition = (position: CssPosition | Position): CssPosition =>
  'x' in position ? { top: `${position.y}px`, left: `${position.x}px` } : position;

const getPosition = (position: CssPosition, size: Optional<CssSize>) =>
  size.fold(
    Fun.constant(position),
    ({ width, height }) => ({
      top: `min(${position.top}, calc(100% - ${height}))`,
      left: `min(${position.left}, calc(100% - ${width}))`,
    })
  );

const getPositioningStyles = (shift: Shift, position: CssPosition | Position, isDragging: boolean, declaredSize: Optional<CssSize>): React.CSSProperties =>
  isDragging ?
    { transform: getTransform(shift), ...getPosition(normalizePosition(position), declaredSize) }
    : getPosition(normalizePosition(position), declaredSize);

export { getPositioningStyles };
