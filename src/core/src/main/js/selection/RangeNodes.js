/**
 * RangeNodes.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.selection.RangeNodes',
  [
  ],
  function () {
    var getSelectedNode = function (range) {
      var startContainer = range.startContainer,
        startOffset = range.startOffset;

      if (startContainer.hasChildNodes() && range.endOffset == startOffset + 1) {
        return startContainer.childNodes[startOffset];
      }

      return null;
    };

    var getNode = function (container, offset) {
      if (container.nodeType === 1 && container.hasChildNodes()) {
        if (offset >= container.childNodes.length) {
          offset = container.childNodes.length - 1;
        }

        container = container.childNodes[offset];
      }

      return container;
    };

    return {
      getSelectedNode: getSelectedNode,
      getNode: getNode
    };
  }
);
