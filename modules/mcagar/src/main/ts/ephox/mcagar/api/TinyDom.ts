import { Node as DomNode, Range } from '@ephox/dom-globals';
import { Struct } from '@ephox/katamari';
import { Element, SimRange } from '@ephox/sugar';

export interface TinyDom {
  fromDom: (elm: DomNode) => Element;
  fromRange: (rng: Range) => SimRange;
}

const range: (range: { start: DomNode; soffset: number; finish: DomNode; foffset: number; }) => SimRange = Struct.immutableBag([ 'start', 'soffset', 'finish', 'foffset' ], [ ]);

const fromDom = function (elm: DomNode) {
  return Element.fromDom(elm);
};

const fromRange = function (rng: Range) {
  return range({
    start: rng.startContainer,
    soffset: rng.startOffset,
    finish: rng.endContainer,
    foffset: rng.endOffset
  });
};

export const TinyDom: TinyDom = {
  fromDom,
  fromRange
};
