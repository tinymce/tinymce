/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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