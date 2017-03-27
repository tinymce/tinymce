/**
 * BlockSelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.blocks.BlockSelection',
  [
    'tinymce.core.blocks.BlockDom',
    'tinymce.core.caret.CaretFinder'
  ],
  function (BlockDom, CaretFinder) {
    var select = function (rootElement, uuid) {
      return BlockDom.findByGuid(rootElement, uuid);
    };

    var unselect = function (rootElement, selectedElement, forward) {
      return BlockDom.findParentBlock(rootElement, selectedElement)
        .bind(function (blockElement) {
          return CaretFinder.fromElementOrReverse(forward, rootElement.dom(), blockElement.dom());
        }).map(function (pos) {
          return pos.toRange();
        });
    };

    return {
      select: select,
      unselect: unselect
    };
  }
);
