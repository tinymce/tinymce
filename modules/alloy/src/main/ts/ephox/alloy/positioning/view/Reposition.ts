import { Option, Struct } from '@ephox/katamari';

export interface RepositionCss {
  position: () => string;
  left: () => Option<number>;
  top: () => Option<number>;
  right: () => Option<number>;
  bottom: () => Option<number>;
}

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
const css: (position: string, left: Option<number>, top: Option<number>, right: Option<number>, bottom: Option<number>) => RepositionCss = Struct.immutable('position', 'left', 'top', 'right', 'bottom');

export {
  decision,
  css
};
