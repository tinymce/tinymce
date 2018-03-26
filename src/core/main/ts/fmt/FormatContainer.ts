/**
 * FormatContainer.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import NodeType from '../dom/NodeType';

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
