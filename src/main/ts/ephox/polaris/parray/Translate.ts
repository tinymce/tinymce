import { Arr, Merger, Fun } from '@ephox/katamari';

/** Adjust a PositionArray positions by an offset */
const translate = function (parray, offset) {
  return Arr.map(parray, function (unit) {
    return Merger.merge(unit, {
      start: Fun.constant(unit.start() + offset),
      finish: Fun.constant(unit.finish() + offset)
    });
  });
};

export default {
  translate
};