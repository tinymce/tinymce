import { Struct } from '@ephox/katamari';
import { Node, Text, Traverse, Element } from '@ephox/sugar';

export interface ElementAndOffset {
  element: () => Element;
  offset: () => number;
}

const point: (element: Element, offset: number) => ElementAndOffset =
  Struct.immutable('element', 'offset');

// NOTE: This only descends once.
const descendOnce = (element: Element, offset: number): ElementAndOffset => {
  const children: Element[] = Traverse.children(element);
  if (children.length === 0) { return point(element, offset); } else if (offset < children.length) { return point(children[offset], 0); } else {
    const last = children[children.length - 1];
    const len = Node.isText(last) ? Text.get(last).length : Traverse.children(last).length;
    return point(last, len);
  }
};

export {
  point,
  descendOnce
};