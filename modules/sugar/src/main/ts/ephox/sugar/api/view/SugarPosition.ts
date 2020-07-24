import { Fun } from '@ephox/katamari';

export interface SugarPosition {
  readonly left: () => number;
  readonly top: () => number;
  readonly translate: (x: number, y: number) => SugarPosition;
}

const r = (left: number, top: number): SugarPosition => {
  const translate = (x: number, y: number): SugarPosition => r(left + x, top + y);

  return {
    left: Fun.constant(left),
    top: Fun.constant(top),
    translate
  };
};

// tslint:disable-next-line:variable-name
export const SugarPosition = r;
