import Element from '../node/Element';
import { Struct } from '@ephox/katamari';

export interface SimRange {
  start: () => Element;
  soffset: () => number;
  finish: () => Element;
  foffset: () => number;
}

const create: (start: Element, soffset: number, finish: Element, foffset: number) => SimRange = Struct.immutable(
  'start',
  'soffset',
  'finish',
  'foffset'
);

// tslint:disable-next-line:variable-name
export const SimRange = {
  create
};