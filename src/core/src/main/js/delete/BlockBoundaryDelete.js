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
    'tinymce.core.delete.BlockBoundary',
    'tinymce.core.delete.MergeBlocks'
  ],
  function (BlockBoundary, MergeBlocks) {
    var backspaceDelete = function (editor, forward) {
      var position;

      position = BlockBoundary.read(editor.getBody(), forward, editor.selection.getRng()).bind(function (blockBoundary) {
        return MergeBlocks.mergeBlocks(forward, blockBoundary.from().block(), blockBoundary.to().block());
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
