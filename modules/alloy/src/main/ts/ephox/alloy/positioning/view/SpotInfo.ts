import { BubbleInstance } from '../layout/Bubble';
import { DirectionAdt } from '../layout/Direction';
import { BoundsRestriction } from '../layout/LayoutBounds';
import { Placement } from '../layout/Placement';

export interface SpotInfo {
  readonly x: number;
  readonly y: number;
  readonly bubble: BubbleInstance;
  readonly direction: DirectionAdt;
  readonly label: string;
  readonly restriction: BoundsRestriction;
  readonly placement: Placement;
  // This flag will pretend that this spot fits within the bounds, no matter whether it does or not
  readonly alwaysFit: boolean;
}

const nu = (
  x: number,
  y: number,
  bubble: BubbleInstance,
  direction: DirectionAdt,
  placement: Placement,
  boundsRestriction: BoundsRestriction,
  labelPrefix: string,
  alwaysFit: boolean = false
): SpotInfo => ({
  x,
  y,
  bubble,
  direction,
  placement,
  restriction: boundsRestriction,
  label: `${labelPrefix}-${placement}`,
  alwaysFit
});

export {
  nu
};
