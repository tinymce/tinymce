import { Arr, Obj, Option } from '@ephox/katamari';
import { Position } from '@ephox/sugar';
import * as Boxes from '../../alien/Boxes';
import { AnchorBox } from './LayoutTypes';

export interface BoundsRestriction {
  left: Option<number>;
  right: Option<number>;
  top: Option<number>;
  bottom: Option<number>;
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
      return anchor.x();
    case AnchorBoxBounds.RightEdge:
      return anchor.x() + anchor.width();
    case AnchorBoxBounds.TopEdge:
      return anchor.y();
    case AnchorBoxBounds.BottomEdge:
      return anchor.y() + anchor.height();
  }
};

export const boundsRestriction = (anchor: AnchorBox, restrictions: Partial<Record<BoundsRestrictionKeys, Restriction>>): BoundsRestriction => {
  return Arr.mapToObject([ 'left', 'right', 'top', 'bottom' ], (dir) => {
    return Obj.get(restrictions, dir).map((restriction) => getRestriction(anchor, restriction));
  });
};

export const adjustBounds = (bounds: Boxes.Bounds, boundsRestrictions: BoundsRestriction, bubbleOffsets: Position) => {
  const applyRestriction = (dir: BoundsRestrictionKeys) => {
    const bubbleOffset = dir === 'top' || dir === 'bottom' ? bubbleOffsets.top() : bubbleOffsets.left();
    return Obj.get(boundsRestrictions, dir).bind((v) => v).map((v) => v + bubbleOffset);
  };

  const adjustedLeft = applyRestriction('left').getOr(bounds.x());
  const adjustedTop = applyRestriction('top').getOr(bounds.y());
  const adjustedRight = applyRestriction('right').getOr(bounds.right());
  const adjustedBottom = applyRestriction('bottom').getOr(bounds.bottom());

  return Boxes.bounds(adjustedLeft, adjustedTop, adjustedRight - adjustedLeft, adjustedBottom - adjustedTop);
};
