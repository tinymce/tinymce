import { DirectionAdt } from '../layout/Direction';

export interface RepositionDecision {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly maxHeight: number;
  readonly maxWidth: number;
  readonly direction: DirectionAdt;
  readonly classes: {
    off: string[];
    on: string[];
  };
  readonly label: string;
  readonly candidateYforTest: number;
}
