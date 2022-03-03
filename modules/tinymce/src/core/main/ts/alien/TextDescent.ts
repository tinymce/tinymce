import { NodeTypes } from '@ephox/sugar';

import * as Spot from './Spot';

const isText = (node: Node): node is Text => node.nodeType === NodeTypes.TEXT;
const isElement = (node: Node): node is Element => node.nodeType === NodeTypes.ELEMENT;

const toLast = (node: Node): Spot.SpotPoint<Node> => {
  if (isText(node)) {
    return Spot.point(node, node.data.length);
  } else {
    const children = node.childNodes;
    // keep descending if there are children.
    return children.length > 0 ? toLast(children[children.length - 1]) : Spot.point(node, children.length);
  }
};

const toLeaf = (node: Node, offset: number): Spot.SpotPoint<Node> => {
  const children = node.childNodes;
  if (children.length > 0 && offset < children.length) {
    return toLeaf(children[offset], 0);
  } else if (children.length > 0 && isElement(node) && children.length === offset) {
    return toLast(children[children.length - 1]);
  } else {
    return Spot.point(node, offset);
  }
};

export {
  toLast,
  toLeaf
};
