import { Struct } from '@ephox/katamari';
import { Node, Text, Traverse } from '@ephox/sugar';

const point = Struct.immutable('element', 'offset');

// NOTE: This only descends once.
const descendOnce = (element, offset) => {
  const children = Traverse.children(element);
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