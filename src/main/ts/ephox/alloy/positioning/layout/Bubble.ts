import { Fun } from '@ephox/katamari';
import { Position } from '@ephox/sugar';
import { SugarPosition } from '../../alien/TypeDefinitions';

export interface Bubble {
  southeast: () => SugarPosition;
  southwest: () => SugarPosition;
  northwest: () => SugarPosition;
  northeast: () => SugarPosition;
}

const nu = (width, yoffset): Bubble => {
  return {
    southeast: Fun.constant(Position(-width, yoffset)),
    southwest: Fun.constant(Position(width, yoffset)),
    northeast: Fun.constant(Position(-width, -yoffset)),
    northwest: Fun.constant(Position(width, -yoffset))
  };
};

export {
  nu
};