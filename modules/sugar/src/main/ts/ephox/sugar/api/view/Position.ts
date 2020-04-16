import { Fun } from '@ephox/katamari';

export interface Position {
  readonly left: () => number;
  readonly top: () => number;
  readonly translate: (x: number, y: number) => Position;
}

const r = (left: number, top: number): Position => {
  const translate = (x: number, y: number): Position => r(left + x, top + y);

  return {
    left: Fun.constant(left),
    top: Fun.constant(top),
    translate
  };
};

// tslint:disable-next-line:variable-name
export const Position = r;
