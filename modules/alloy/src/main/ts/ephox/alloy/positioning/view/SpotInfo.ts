import { Struct } from '@ephox/katamari';
import { Bounds } from '../../alien/Boxes';
import { BubbleInstance } from '../layout/Bubble';

export interface SpotInfo {
  x: () => number;
  y: () => number;
  bubble: () => BubbleInstance;
  // TYPIFY
  direction: () => any;
  label: () => string;
  bounds: () => Bounds;
}

const nu: (
  x: number,
  y: number,
  bubble: BubbleInstance,
  direction: any,
  bounds: Bounds,
  label: string
) => SpotInfo = Struct.immutable('x', 'y', 'bubble', 'direction', 'bounds', 'label');

export {
  nu
};
