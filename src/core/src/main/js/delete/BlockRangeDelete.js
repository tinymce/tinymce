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
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Options',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.PredicateFind',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.delete.DeleteUtils',
    'tinymce.core.delete.MergeBlocks',
    'tinymce.core.dom.ElementType'
  ],
  function (Fun, Options, Compare, Element, PredicateFind, CaretFinder, CaretPosition, DeleteUtils, MergeBlocks, ElementType) {
    var deleteRangeMergeBlocks = function (rootNode, selection) {
      var rng = selection.getRng();

      return Options.liftN([
        DeleteUtils.getParentBlock(rootNode, Element.fromDom(rng.startContainer)),
        DeleteUtils.getParentBlock(rootNode, Element.fromDom(rng.endContainer))
      ], function (block1, block2) {
        if (Compare.eq(block1, block2) === false) {
          rng.deleteContents();

          MergeBlocks.mergeBlocks(rootNode, true, block1, block2).each(function (pos) {
            selection.setRng(pos.toRange());
          });

          return true;
        } else {
          return false;
        }
      }).getOr(false);
    };

    var isRawNodeInTable = function (root, rawNode) {
      var node = Element.fromDom(rawNode);
      var isRoot = Fun.curry(Compare.eq, root);
      return PredicateFind.ancestor(node, ElementType.isTableCell, isRoot).isSome();
    };

    var isSelectionInTable = function (root, rng) {
      return isRawNodeInTable(root, rng.startContainer) || isRawNodeInTable(root, rng.endContainer);
    };

    var isEverythingSelected = function (root, rng) {
      var noPrevious = CaretFinder.prevPosition(root.dom(), CaretPosition.fromRangeStart(rng)).isNone();
      var noNext = CaretFinder.nextPosition(root.dom(), CaretPosition.fromRangeEnd(rng)).isNone();
      return !isSelectionInTable(root, rng) && noPrevious && noNext;
    };

    var emptyEditor = function (editor) {
      editor.setContent('');
      editor.selection.setCursorLocation();
      return true;
    };

    var deleteRange = function (editor) {
      var rootNode = Element.fromDom(editor.getBody());
      var rng = editor.selection.getRng();
      return isEverythingSelected(rootNode, rng) ? emptyEditor(editor) : deleteRangeMergeBlocks(rootNode, editor.selection);
    };

    var backspaceDelete = function (editor, forward) {
      return editor.selection.isCollapsed() ? false : deleteRange(editor, editor.selection.getRng());
    };

    return {
      backspaceDelete: backspaceDelete
    };
  }
);
