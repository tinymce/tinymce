import { Struct } from '@ephox/katamari';
import { BubbleInstance, Bubble } from '../layout/Bubble';

export interface SpotInfo {
  x: () => number;
  y: () => number;
  bubble: () => BubbleInstance;
  // TYPIFY
  direction: () => any;
  label: () => string;
}

const nu: (
  x: number,
  y: number,
  bubble: BubbleInstance,
  direction: any,
  label: string
) => SpotInfo = Struct.immutable('x', 'y', 'bubble', 'direction', 'label');

export {
  nu
};