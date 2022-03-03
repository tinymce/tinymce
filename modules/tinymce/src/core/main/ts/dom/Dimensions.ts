import { Arr } from '@ephox/katamari';

import * as ClientRect from '../geom/ClientRect';
import * as NodeType from './NodeType';

type GeomClientRect = ClientRect.ClientRect;

export interface NodeClientRect extends GeomClientRect {
  node: Node;
}

const getNodeClientRects = (node: Node): NodeClientRect[] => {
  const toArrayWithNode = (clientRects: DOMRectList): NodeClientRect[] => {
    return Arr.map(clientRects, (rect) => {
      const clientRect = ClientRect.clone(rect) as NodeClientRect;
      clientRect.node = node;
      return clientRect;
    });
  };

  if (NodeType.isElement(node)) {
    return toArrayWithNode(node.getClientRects());
  } else if (NodeType.isText(node)) {
    const rng = node.ownerDocument.createRange();

    rng.setStart(node, 0);
    rng.setEnd(node, node.data.length);

    return toArrayWithNode(rng.getClientRects());
  } else {
    return [];
  }
};

const getClientRects = (nodes: Node[]): NodeClientRect[] => Arr.bind(nodes, getNodeClientRects);

export {
  getClientRects
};
