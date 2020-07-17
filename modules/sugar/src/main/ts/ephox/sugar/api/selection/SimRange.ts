import { Fun } from '@ephox/katamari';
import { SugarElement } from '../node/SugarElement';

export interface SimRange {
  start: () => SugarElement<Node>;
  soffset: () => number;
  finish: () => SugarElement<Node>;
  foffset: () => number;
}

const create = (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number): SimRange => ({
  start: Fun.constant(start),
  soffset: Fun.constant(soffset),
  finish: Fun.constant(finish),
  foffset: Fun.constant(foffset)
});

// tslint:disable-next-line:variable-name
export const SimRange = {
  create
};
