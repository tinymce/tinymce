import { Fun } from '@ephox/katamari';
import { BubbleInstance } from '../layout/Bubble';
import { DirectionAdt } from '../layout/Direction';
import { BoundsRestriction } from '../layout/LayoutBounds';

export interface SpotInfo {
  readonly x: () => number;
  readonly y: () => number;
  readonly bubble: () => BubbleInstance;
  readonly direction: () => DirectionAdt;
  readonly label: () => string;
  readonly boundsRestriction: () => BoundsRestriction;
}

const nu = (
  x: number,
  y: number,
  bubble: BubbleInstance,
  direction: DirectionAdt,
  boundsRestriction: BoundsRestriction,
  label: string
): SpotInfo => ({
  x: Fun.constant(x),
  y: Fun.constant(y),
  bubble: Fun.constant(bubble),
  direction: Fun.constant(direction),
  boundsRestriction: Fun.constant(boundsRestriction),
  label: Fun.constant(label)
});

export {
  nu
};
