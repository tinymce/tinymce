import type * as Boxes from '../../alien/Boxes';
import type { DirectionAdt } from '../layout/Direction';
import type { Placement } from '../layout/Placement';

export interface RepositionDecision {
  readonly rect: Boxes.Rect;
  readonly maxHeight: number;
  readonly maxWidth: number;
  readonly direction: DirectionAdt;
  readonly placement: Placement;
  readonly classes: {
    readonly off: string[];
    readonly on: string[];
  };
  readonly layout: string;
  readonly testY: number;
}
