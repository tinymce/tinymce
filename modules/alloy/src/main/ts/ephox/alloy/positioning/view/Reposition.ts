import { Struct, Option } from '@ephox/katamari';

export interface RepositionCss {
  position: () => any;
  left: () => Option<number>;
  top: () => Option<number>;
  right: () => Option<number>;
  bottom: () => Option<number>;
}

export interface RepositionDecision {
  x: () => number;
  y: () => number;
  width: () => number;
  height: () => number;
  maxHeight: () => number;
  direction: () => any;
  classes: () => {
    off: string[];
    on: string[]
  };
  label: () => string;
  candidateYforTest: any;
}

const decision: (...args)  => RepositionDecision = Struct.immutableBag(['x', 'y', 'width', 'height', 'maxHeight', 'direction', 'classes', 'label', 'candidateYforTest'], []);
const css: (...args) => RepositionCss = Struct.immutable('position', 'left', 'top', 'right', 'bottom');

export {
  decision,
  css
};