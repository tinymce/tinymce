import * as Boxes from '../../alien/Boxes';
import { BubbleInstance } from './Bubble';
import { AnchorBox } from './LayoutTypes';

type BoundFunc = (bounds: number, anchor: AnchorBox, bubbleOffset: number) => number;

export const anchorLeft = (bounds: number, anchor: AnchorBox, bubbleOffset: number) => anchor.x() + bubbleOffset;
export const anchorRight = (bounds: number, anchor: AnchorBox, bubbleOffset: number) => anchor.x() + anchor.width() + bubbleOffset;
export const anchorTop = (bounds: number, anchor: AnchorBox, bubbleOffset: number) => anchor.y() + bubbleOffset;
export const anchorBottom = (bounds: number, anchor: AnchorBox, bubbleOffset: number) => anchor.y() + anchor.height() + bubbleOffset;

export const adjustBounds = (bounds: Boxes.Bounds, anchor: AnchorBox, bubble: BubbleInstance, left: BoundFunc, top: BoundFunc, right: BoundFunc, bottom: BoundFunc) => {
  const bubbleLeft = bubble.offset().left();
  const bubbleTop = bubble.offset().top();

  const adjustedLeft = left(bounds.x(), anchor, bubbleLeft);
  const adjustedTop = top(bounds.y(), anchor, bubbleTop);
  const adjustedRight = right(bounds.right(), anchor, bubbleLeft);
  const adjustedBottom = bottom(bounds.bottom(), anchor, bubbleTop);

  return Boxes.bounds(adjustedLeft, adjustedTop, adjustedRight - adjustedLeft, adjustedBottom - adjustedTop);
};
