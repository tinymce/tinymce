import Element from '../node/Element';
import { Struct } from '@ephox/katamari';
import { Node as DomNode } from '@ephox/dom-globals';

export interface SimRange {
  start: () => Element<DomNode>;
  soffset: () => number;
  finish: () => Element<DomNode>;
  foffset: () => number;
}

const create: (start: Element<DomNode>, soffset: number, finish: Element<DomNode>, foffset: number) => SimRange = Struct.immutable(
  'start',
  'soffset',
  'finish',
  'foffset'
);

// tslint:disable-next-line:variable-name
export const SimRange = {
  create
};