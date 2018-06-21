/**
 * RangeNodes.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Range, Node } from '@ephox/dom-globals';

const getSelectedNode = function (range: Range): Node {
  const startContainer = range.startContainer,
    startOffset = range.startOffset;

  if (startContainer.hasChildNodes() && range.endOffset === startOffset + 1) {
    return startContainer.childNodes[startOffset];
  }

  return null;
};

const getNode = function (container: Node, offset: number): Node {
  if (container.nodeType === 1 && container.hasChildNodes()) {
    if (offset >= container.childNodes.length) {
      offset = container.childNodes.length - 1;
    }

    container = container.childNodes[offset];
  }

  return container;
};

export {
  getSelectedNode,
  getNode
};