/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import NodeType from '../dom/NodeType';
import { Node } from '@ephox/dom-globals';

const CARET_ID = '_mce_caret';
const isCaretNode = (node: Node) => NodeType.isElement(node) && node.id === CARET_ID;

const getParentCaretContainer = function (body, node) {
  while (node && node !== body) {
    if (node.id === CARET_ID) {
      return node;
    }

    node = node.parentNode;
  }

  return null;
};

export {
  isCaretNode,
  getParentCaretContainer
};
