import { Fun } from '@ephox/katamari';
import { BubbleInstance } from '../layout/Bubble';

export interface SpotInfo {
  x: () => number;
  y: () => number;
  bubble: () => BubbleInstance;
  // TYPIFY
  direction: () => any;
  label: () => string;
}

const nu = (
  x: number,
  y: number,
  bubble: BubbleInstance,
  direction: any,
  label: string
): SpotInfo => ({
  x: Fun.constant(x),
  y: Fun.constant(y),
  bubble: Fun.constant(bubble),
  direction: Fun.constant(direction),
  label: Fun.constant(label)
});

export {
  nu
};
