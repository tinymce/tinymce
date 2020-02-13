import { Struct } from '@ephox/katamari';

export interface RepositionDecisionSpec {
  x: number;
  y: number;
  width: number;
  height: number;
  maxHeight: number;
  maxWidth: number;
  direction: any;
  classes: {
    off: string[];
    on: string[]
  };
  label: string;
  candidateYforTest: number;
}

export interface RepositionDecision {
  x: () => number;
  y: () => number;
  width: () => number;
  height: () => number;
  maxHeight: () => number;
  maxWidth: () => number;
  direction: () => any;
  classes: () => {
    off: string[];
    on: string[]
  };
  label: () => string;
  candidateYforTest: () => number;
}

const decision: (obj: RepositionDecisionSpec) => RepositionDecision = Struct.immutableBag(['x', 'y', 'width', 'height', 'maxHeight', 'maxWidth', 'direction', 'classes', 'label', 'candidateYforTest'], []);

export {
  decision
};
