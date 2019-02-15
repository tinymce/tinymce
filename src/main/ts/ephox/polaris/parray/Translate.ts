import { Arr, Fun } from '@ephox/katamari';
import { PRange } from '../pattern/Types';

/** Adjust a PositionArray positions by an offset */
const translate = function <T extends PRange> (parray: T[], offset: number) {
  return Arr.map<T, T>(parray, function (unit) {
    return {
      ...unit,
      start: Fun.constant(unit.start() + offset),
      finish: Fun.constant(unit.finish() + offset)
    };
  });
};

export {
  translate
};