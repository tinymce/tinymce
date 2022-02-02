import { Arr, Num, Obj, Optional } from '@ephox/katamari';
import { SugarPosition } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import { AnchorBox } from './LayoutTypes';

export interface BoundsRestriction {
  readonly left: Optional<number>;
  readonly right: Optional<number>;
  readonly top: Optional<number>;
  readonly bottom: Optional<number>;
}

export const enum AnchorBoxBounds {
  RightEdge,
  LeftEdge,
  TopEdge,
  BottomEdge
}

type BoundsRestrictionKeys = keyof BoundsRestriction;
type Restriction = AnchorBoxBounds;

const getRestriction = (anchor: AnchorBox, restriction: Restriction) => {
  switch (restriction) {
    case AnchorBoxBounds.LeftEdge:
      return anchor.x;
    case AnchorBoxBounds.RightEdge:
      return anchor.x + anchor.width;
    case AnchorBoxBounds.TopEdge:
      return anchor.y;
    case AnchorBoxBounds.BottomEdge:
      return anchor.y + anchor.height;
  }
};

export const boundsRestriction = (
  anchor: AnchorBox,
  restrictions: Partial<Record<BoundsRestrictionKeys, Restriction>>
): BoundsRestriction => Arr.mapToObject(
  [ 'left', 'right', 'top', 'bottom' ],
  (dir) => Obj.get(restrictions, dir).map(
    (restriction) => getRestriction(anchor, restriction)
  )
);

export const adjustBounds = (bounds: Boxes.Bounds, restriction: BoundsRestriction, bubbleOffset: SugarPosition): Boxes.Bounds => {
  const applyRestriction = (dir: BoundsRestrictionKeys, current: number) =>
    restriction[dir].map((pos) => {
      const isVerticalAxis = dir === 'top' || dir === 'bottom';
      const offset = isVerticalAxis ? bubbleOffset.top : bubbleOffset.left;
      const comparator = dir === 'left' || dir === 'top' ? Math.max : Math.min;
      const newPos = comparator(pos, current) + offset;
      // Ensure the new restricted position is within the current bounds
      return isVerticalAxis ? Num.clamp(newPos, bounds.y, bounds.bottom) : Num.clamp(newPos, bounds.x, bounds.right);
    }).getOr(current);

  const adjustedLeft = applyRestriction('left', bounds.x);
  const adjustedTop = applyRestriction('top', bounds.y);
  const adjustedRight = applyRestriction('right', bounds.right);
  const adjustedBottom = applyRestriction('bottom', bounds.bottom);

  return Boxes.bounds(adjustedLeft, adjustedTop, adjustedRight - adjustedLeft, adjustedBottom - adjustedTop);
};
