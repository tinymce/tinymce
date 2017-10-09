/**
 * BlockBoundaryDelete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.BlockBoundaryDelete',
  [
    'ephox.sugar.api.node.Element',
    'tinymce.core.delete.BlockBoundary',
    'tinymce.core.delete.MergeBlocks'
  ],
  function (Element, BlockBoundary, MergeBlocks) {
    var backspaceDelete = function (editor, forward) {
      var position, rootNode = Element.fromDom(editor.getBody());

      position = BlockBoundary.read(rootNode.dom(), forward, editor.selection.getRng()).bind(function (blockBoundary) {
        return MergeBlocks.mergeBlocks(rootNode, forward, blockBoundary.from().block(), blockBoundary.to().block());
      });

      position.each(function (pos) {
        editor.selection.setRng(pos.toRange());
      });

      return position.isSome();
    };

    return {
      backspaceDelete: backspaceDelete
    };
  }
);
