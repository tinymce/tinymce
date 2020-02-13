/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, Node } from '@ephox/dom-globals';
import NodeType from '../dom/NodeType';

const CARET_ID = '_mce_caret';
const isCaretNode = (node: Node) => NodeType.isElement(node) && node.id === CARET_ID;

const getParentCaretContainer = function (body: Node, node: Node) {
  while (node && node !== body) {
    if ((node as Element).id === CARET_ID) {
      return node;
    }

    node = node.parentNode as Element;
  }

  return null;
};

export {
  isCaretNode,
  getParentCaretContainer
};
