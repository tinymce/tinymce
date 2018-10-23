import { Fun } from '@ephox/katamari';

export interface Position {
  left: () => number,
  top: () => number,
  translate: (x: number, y: number) => Position
}

var r = function (left: number, top: number): Position {
  var translate = function (x: number, y: number): Position {
    return r(left + x, top + y);
  };

  return {
    left: Fun.constant(left),
    top: Fun.constant(top),
    translate: translate
  };
};

export const Position = r;