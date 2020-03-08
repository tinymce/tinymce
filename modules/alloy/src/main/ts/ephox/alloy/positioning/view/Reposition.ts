import { Struct } from '@ephox/katamari';
import { DirectionAdt } from '../layout/Direction';

export interface RepositionDecisionSpec {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly maxHeight: number;
  readonly maxWidth: number;
  readonly direction: DirectionAdt;
  readonly classes: {
    off: string[];
    on: string[]
  };
  readonly label: string;
  readonly candidateYforTest: number;
}

export interface RepositionDecision {
  readonly x: () => number;
  readonly y: () => number;
  readonly width: () => number;
  readonly height: () => number;
  readonly maxHeight: () => number;
  readonly maxWidth: () => number;
  readonly direction: () => DirectionAdt;
  readonly classes: () => {
    off: string[];
    on: string[]
  };
  readonly label: () => string;
  readonly candidateYforTest: () => number;
}

const decision: (obj: RepositionDecisionSpec) => RepositionDecision = Struct.immutableBag(['x', 'y', 'width', 'height', 'maxHeight', 'maxWidth', 'direction', 'classes', 'label', 'candidateYforTest'], []);

export {
  decision
};
