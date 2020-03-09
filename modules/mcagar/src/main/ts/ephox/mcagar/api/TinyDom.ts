import { Node as DomNode, Range } from '@ephox/dom-globals';
import { Element, SimRange } from '@ephox/sugar';

export interface TinyDom {
  fromDom: (elm: DomNode) => Element;
  fromRange: (rng: Range) => SimRange;
}

const fromDom = (elm: DomNode): Element<DomNode> =>
  Element.fromDom(elm);

const fromRange = (rng: Range): SimRange =>
  SimRange.create(
    Element.fromDom(rng.startContainer),
    rng.startOffset,
    Element.fromDom(rng.endContainer), rng.endOffset
  );

export const TinyDom: TinyDom = {
  fromDom,
  fromRange
};
