/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import * as ClientRect from '../geom/ClientRect';
import * as NodeType from './NodeType';

export interface NodeClientRect extends ClientRect.ClientRect {
  node: HTMLElement;
}

const getNodeClientRects = (node: Node): NodeClientRect[] => {
  const toArrayWithNode = (clientRects) => {
    return Arr.map(clientRects, (clientRect) => {
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

const getClientRects = (nodes: Node[]): NodeClientRect[] => Arr.bind(nodes, getNodeClientRects);

export {
  getClientRects
};
