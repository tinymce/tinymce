import * as Boxes from '../../alien/Boxes';
import { DirectionAdt } from '../layout/Direction';
import { Placement } from '../layout/Placement';

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
