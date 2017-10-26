/**
 * SplitRange.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.selection.SplitRange',
  [
    'tinymce.core.dom.NodeType'
  ],
  function (NodeType) {
    var splitText = function (node, offset) {
      return node.splitText(offset);
    };

    var split = function (rng) {
      var startContainer = rng.startContainer,
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
        startContainer: startContainer,
        startOffset: startOffset,
        endContainer: endContainer,
        endOffset: endOffset
      };
    };

    return {
      split: split
    };
  }
);
