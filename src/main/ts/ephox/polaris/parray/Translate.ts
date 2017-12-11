import { Arr } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';

/** Adjust a PositionArray positions by an offset */
var translate = function (parray, offset) {
  return Arr.map(parray, function (unit) {
    return Merger.merge(unit, {
      start: Fun.constant(unit.start() + offset),
      finish: Fun.constant(unit.finish() + offset)
    });
  });
};

export default <any> {
  translate: translate
};