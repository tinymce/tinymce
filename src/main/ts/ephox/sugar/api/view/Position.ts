import { Fun } from '@ephox/katamari';

export interface Position {
  left: () => number;
  top: () => number;
  translate: (x: number, y: number) => Position;
}

const r = function (left: number, top: number): Position {
  const translate = function (x: number, y: number): Position {
    return r(left + x, top + y);
  };

  return {
    left: Fun.constant(left),
    top: Fun.constant(top),
    translate
  };
};

// tslint:disable-next-line:variable-name
export const Position = r;