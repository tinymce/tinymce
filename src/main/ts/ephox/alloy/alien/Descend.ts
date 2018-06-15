import { Struct } from '@ephox/katamari';
import { Node, Text, Traverse } from '@ephox/sugar';
import { SugarElement } from 'ephox/alloy/alien/TypeDefinitions';

export interface ElementAndOffset {
  element: () => SugarElement;
  offset: () => number;
}

const point: (element: SugarElement, offset: number) => ElementAndOffset =
  Struct.immutable('element', 'offset')

// NOTE: This only descends once.
const descendOnce = (element: SugarElement, offset: number): ElementAndOffset => {
  const children: SugarElement[] = Traverse.children(element);
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