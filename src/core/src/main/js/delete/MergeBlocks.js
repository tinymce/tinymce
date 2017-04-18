/**
 * MergeBlocks.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.MergeBlocks',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.Traverse',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.Empty',
    'tinymce.core.dom.NodeType'
  ],
  function (Arr, Option, Insert, Remove, Element, Traverse, CaretFinder, CaretPosition, Empty, NodeType) {
    var mergeBlocksAndReposition = function (fromBlock, toBlock, toPosition) {
      var children = Traverse.children(fromBlock);

      if (NodeType.isBr(toPosition.getNode())) {
        Remove.remove(Element.fromDom(toPosition.getNode()));
      }

      Arr.each(children, function (node) {
        Insert.append(toBlock, node);
      });

      if (Empty.isEmpty(fromBlock)) {
        Remove.remove(fromBlock);
      }

      return children.length > 0 ? Option.some(toPosition) : Option.none();
    };

    var mergeBlocks = function (forward, block1, block2) {
      if (forward) {
        return CaretFinder.positionIn(false, block1.dom()).bind(function (toPosition) {
          return mergeBlocksAndReposition(block2, block1, toPosition);
        });
      } else {
        return CaretFinder.positionIn(false, block2.dom()).bind(function (toPosition) {
          return mergeBlocksAndReposition(block1, block2, toPosition);
        });
      }
    };

    return {
      mergeBlocks: mergeBlocks
    };
  }
);
