import { Struct } from '@ephox/katamari';
import { SugarPosition } from '../../alien/TypeDefinitions';

export interface SpotInfo {
  x: () => number;
  y: () => number;
  bubble: () => SugarPosition;
  // TYPIFY
  direction: () => any;
  anchors: () => any;
  label: () => string;
}

const nu: (
  x: number,
  y: number,
  bubble: SugarPosition,
  direction: any,
  anchors: any,
  label: string
) => SpotInfo = Struct.immutable('x', 'y', 'bubble', 'direction', 'anchors', 'label');

export {
  nu
};