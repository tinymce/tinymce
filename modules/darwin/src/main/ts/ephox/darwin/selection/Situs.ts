import { Situ, Element } from '@ephox/sugar';
import { Fun } from '@ephox/katamari';

export interface Situs {
  start: () => Situ;
  finish: () => Situ;
}

const create = function (start: Element, soffset: number, finish: Element, foffset: number): Situs {
  return {
    start: Fun.constant(Situ.on(start, soffset)),
    finish: Fun.constant(Situ.on(finish, foffset))
  };
};

export const Situs = {
  create
};