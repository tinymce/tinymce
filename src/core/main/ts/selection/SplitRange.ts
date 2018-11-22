/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import NodeType from '../dom/NodeType';

const splitText = function (node, offset) {
  return node.splitText(offset);
};

const split = function (rng) {
  let startContainer = rng.startContainer,
    startOffset = rng.startOffset,
    endContainer = rng.endContainer,
    endOffset = rng.endOffset;

  // Handle single text node
  if (startContainer === endContainer && NodeType.isText(startContainer)) {
    if (startOffset > 0 && startOffset < startContainer.nodeValue.length) {
      endContainer = splitText(startContainer, startOffset);
      startContainer = endContainer.previousSibling;

      if (endOffset > startOffset) {
        endOffset = endOffset - startOffset;
        startContainer = endContainer = splitText(endContainer, endOffset).previousSibling;
        endOffset = endContainer.nodeValue.length;
        startOffset = 0;
      } else {
        endOffset = 0;
      }
    }
  } else {
    // Split startContainer text node if needed
    if (NodeType.isText(startContainer) && startOffset > 0 && startOffset < startContainer.nodeValue.length) {
      startContainer = splitText(startContainer, startOffset);
      startOffset = 0;
    }

    // Split endContainer text node if needed
    if (NodeType.isText(endContainer) && endOffset > 0 && endOffset < endContainer.nodeValue.length) {
      endContainer = splitText(endContainer, endOffset).previousSibling;
      endOffset = endContainer.nodeValue.length;
    }
  }

  return {
    startContainer,
    startOffset,
    endContainer,
    endOffset
  };
};

export default {
  split
};