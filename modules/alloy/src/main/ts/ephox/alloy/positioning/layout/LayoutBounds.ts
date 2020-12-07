import { Arr, Fun, Obj, Optional } from '@ephox/katamari';
import { SugarPosition } from '@ephox/sugar';
import * as Boxes from '../../alien/Boxes';
import { AnchorBox } from './LayoutTypes';

export interface BoundsRestriction {
  left: Optional<number>;
  right: Optional<number>;
  top: Optional<number>;
  bottom: Optional<number>;
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

export const adjustBounds = (bounds: Boxes.Bounds, boundsRestrictions: BoundsRestriction, bubbleOffsets: SugarPosition): Boxes.Bounds => {
  const applyRestriction = (dir: BoundsRestrictionKeys, current: number) => {
    const bubbleOffset = dir === 'top' || dir === 'bottom' ? bubbleOffsets.top : bubbleOffsets.left;
    return Obj.get(boundsRestrictions, dir).bind(Fun.identity)
      .bind((restriction): Optional<number> => {
        // Ensure the restriction is within the current bounds
        if (dir === 'left' || dir === 'top') {
          return restriction >= current ? Optional.some(restriction) : Optional.none();
        } else {
          return restriction <= current ? Optional.some(restriction) : Optional.none();
        }
      })
      .map((restriction) => restriction + bubbleOffset)
      .getOr(current);
  };

  const adjustedLeft = applyRestriction('left', bounds.x);
  const adjustedTop = applyRestriction('top', bounds.y);
  const adjustedRight = applyRestriction('right', bounds.right);
  const adjustedBottom = applyRestriction('bottom', bounds.bottom);

  return Boxes.bounds(adjustedLeft, adjustedTop, adjustedRight - adjustedLeft, adjustedBottom - adjustedTop);
};
