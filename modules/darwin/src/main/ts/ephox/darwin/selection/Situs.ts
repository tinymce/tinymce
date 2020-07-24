import { Fun } from '@ephox/katamari';
import { Situ, SugarElement } from '@ephox/sugar';

export interface Situs {
  start: () => Situ;
  finish: () => Situ;
}

const create = function (start: SugarElement, soffset: number, finish: SugarElement, foffset: number): Situs {
  return {
    start: Fun.constant(Situ.on(start, soffset)),
    finish: Fun.constant(Situ.on(finish, foffset))
  };
};

export const Situs = {
  create
};
