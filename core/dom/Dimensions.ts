/**
 * Dimensions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Arr from '../util/Arr';
import NodeType from './NodeType';
import * as ClientRect from '../geom/ClientRect';

export interface NodeClientRect extends ClientRect {
  node: HTMLElement;
}

const getNodeClientRects = (node: Node): NodeClientRect[] => {
  const toArrayWithNode = function (clientRects) {
    return Arr.map(clientRects, function (clientRect) {
      clientRect = ClientRect.clone(clientRect);
      clientRect.node = node;

      return clientRect;
    });
  };

  if (NodeType.isElement(node)) {
    return toArrayWithNode(node.getClientRects());
  }

  if (NodeType.isText(node)) {
    const rng = node.ownerDocument.createRange();

    rng.setStart(node, 0);
    rng.setEnd(node, node.data.length);

    return toArrayWithNode(rng.getClientRects());
  }
};

const getClientRects = (node: Node[]): NodeClientRect[] => {
  return Arr.reduce(node, function (result, node) {
    return result.concat(getNodeClientRects(node));
  }, []);
};

export {
  getClientRects
};
