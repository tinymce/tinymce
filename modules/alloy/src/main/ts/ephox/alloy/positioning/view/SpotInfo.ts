import { Struct } from '@ephox/katamari';
import { BubbleInstance } from '../layout/Bubble';
import { DirectionAdt } from '../layout/Direction';
import { BoundsRestriction } from '../layout/LayoutBounds';

export interface SpotInfo {
  x: () => number;
  y: () => number;
  bubble: () => BubbleInstance;
  direction: () => DirectionAdt;
  label: () => string;
  boundsRestriction: () => BoundsRestriction;
}

const nu: (
  x: number,
  y: number,
  bubble: BubbleInstance,
  direction: DirectionAdt,
  boundsRestriction: BoundsRestriction,
  label: string
) => SpotInfo = Struct.immutable('x', 'y', 'bubble', 'direction', 'boundsRestriction', 'label');

export {
  nu
};
