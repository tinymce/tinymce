import { BubbleInstance } from '../layout/Bubble';
import { DirectionAdt } from '../layout/Direction';
import { BoundsRestriction } from '../layout/LayoutBounds';
import { LayoutLabels } from '../layout/LayoutLabels';

export interface SpotInfo {
  readonly x: number;
  readonly y: number;
  readonly bubble: BubbleInstance;
  readonly direction: DirectionAdt;
  readonly label: string;
  readonly boundsRestriction: BoundsRestriction;
  readonly fitAnyway: boolean;
}

const nu = (
  x: number,
  y: number,
  bubble: BubbleInstance,
  direction: DirectionAdt,
  boundsRestriction: BoundsRestriction,
  label: LayoutLabels,
  fitAnyway: boolean
): SpotInfo => ({
  x,
  y,
  bubble,
  direction,
  boundsRestriction,
  label,
  fitAnyway
});

export {
  nu
};
