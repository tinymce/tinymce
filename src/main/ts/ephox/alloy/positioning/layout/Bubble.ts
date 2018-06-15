import { Fun } from '@ephox/katamari';
import { Position } from '@ephox/sugar';

export default <any> (width, yoffset) => {
  return {
    southeast: Fun.constant(Position(-width, yoffset)),
    southwest: Fun.constant(Position(width, yoffset)),
    northeast: Fun.constant(Position(-width, -yoffset)),
    northwest: Fun.constant(Position(width, -yoffset))
  };
};