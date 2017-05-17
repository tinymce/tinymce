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
    var mergeBlocksAndReposition = function (forward, fromBlock, toBlock, toPosition) {
      var children = Traverse.children(fromBlock);

      if (NodeType.isBr(toPosition.getNode())) {
        Remove.remove(Element.fromDom(toPosition.getNode()));
        toPosition = CaretFinder.positionIn(false, toBlock.dom()).getOr(toPosition);
      }

      if (Empty.isEmpty(fromBlock) === false) {
        Arr.each(children, function (node) {
          Insert.append(toBlock, node);
        });
      }

      if (Empty.isEmpty(fromBlock)) {
        Remove.remove(fromBlock);
      }

      return children.length > 0 ? Option.from(toPosition) : Option.none();
    };

    var mergeBlocks = function (forward, block1, block2) {
      if (forward) {
        if (Empty.isEmpty(block1)) {
          Remove.remove(block1);
          return CaretFinder.positionIn(true, block2.dom());
        } else {
          return CaretFinder.positionIn(false, block1.dom()).bind(function (toPosition) {
            return mergeBlocksAndReposition(forward, block2, block1, toPosition);
          });
        }
      } else {
        if (Empty.isEmpty(block2)) {
          Remove.remove(block2);
          return CaretFinder.positionIn(true, block1.dom());
        } else {
          return CaretFinder.positionIn(false, block2.dom()).bind(function (toPosition) {
            return mergeBlocksAndReposition(forward, block1, block2, toPosition);
          });
        }
      }
    };

    return {
      mergeBlocks: mergeBlocks
    };
  }
);
