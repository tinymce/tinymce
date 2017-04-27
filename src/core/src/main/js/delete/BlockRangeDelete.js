/**
 * BlockRangeDelete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.BlockRangeDelete',
  [
    'ephox.katamari.api.Options',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'tinymce.core.delete.DeleteUtils',
    'tinymce.core.delete.MergeBlocks'
  ],
  function (Options, Compare, Element, DeleteUtils, MergeBlocks) {
    var deleteRange = function (rootNode, selection) {
      var rng = selection.getRng();

      return Options.liftN([
        DeleteUtils.getParentTextBlock(rootNode, Element.fromDom(rng.startContainer)),
        DeleteUtils.getParentTextBlock(rootNode, Element.fromDom(rng.endContainer))
      ], function (block1, block2) {
        if (Compare.eq(block1, block2) === false) {
          rng.deleteContents();

          MergeBlocks.mergeBlocks(true, block1, block2).each(function (pos) {
            selection.setRng(pos.toRange());
          });

          return true;
        } else {
          return false;
        }
      }).getOr(false);
    };

    var backspaceDelete = function (editor, forward) {
      var rootNode = Element.fromDom(editor.getBody());

      if (editor.selection.isCollapsed() === false) {
        return deleteRange(rootNode, editor.selection);
      } else {
        return false;
      }
    };

    return {
      backspaceDelete: backspaceDelete
    };
  }
);
