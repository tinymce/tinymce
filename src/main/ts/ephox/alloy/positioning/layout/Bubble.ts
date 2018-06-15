import { Fun } from '@ephox/katamari';
import { Position } from '@ephox/sugar';
import { SugarPosition } from 'ephox/alloy/alien/TypeDefinitions';

export interface Bubble {
  southeast: () => SugarPosition;
  southwest: () => SugarPosition;
  northwest: () => SugarPosition;
  northeast: () => SugarPosition;
}

export default (width, yoffset): Bubble => {
  return {
    southeast: Fun.constant(Position(-width, yoffset)),
    southwest: Fun.constant(Position(width, yoffset)),
    northeast: Fun.constant(Position(-width, -yoffset)),
    northwest: Fun.constant(Position(width, -yoffset))
  };
};