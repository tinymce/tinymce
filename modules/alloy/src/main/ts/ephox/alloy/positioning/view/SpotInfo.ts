import { Fun } from '@ephox/katamari';
import { BubbleInstance } from '../layout/Bubble';

export interface SpotInfo {
  readonly x: () => number;
  readonly y: () => number;
  readonly bubble: () => BubbleInstance;
  // TYPIFY
  readonly direction: () => any;
  readonly label: () => string;
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
