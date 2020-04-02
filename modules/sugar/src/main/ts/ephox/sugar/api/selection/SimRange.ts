import Element from '../node/Element';
import { Fun } from '@ephox/katamari';
import { Node as DomNode } from '@ephox/dom-globals';

export interface SimRange {
  start: () => Element<DomNode>;
  soffset: () => number;
  finish: () => Element<DomNode>;
  foffset: () => number;
}

const create = (
  start: Element<DomNode>,
  soffset: number,
  finish: Element<DomNode>,
  foffset: number
): SimRange => ({
  start: Fun.constant(start),
  soffset: Fun.constant(soffset),
  finish: Fun.constant(finish),
  foffset: Fun.constant(foffset)
});

// tslint:disable-next-line:variable-name
export const SimRange = {
  create
};
