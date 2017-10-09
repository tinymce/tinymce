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
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.Traverse',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.ElementType',
    'tinymce.core.dom.Empty',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.Parents'
  ],
  function (Arr, Option, Compare, Insert, Remove, Element, Traverse, CaretFinder, CaretPosition, ElementType, Empty, NodeType, Parents) {
    var getChildrenUntilBlockBoundary = function (block) {
      var children = Traverse.children(block);
      return Arr.findIndex(children, ElementType.isBlock).fold(
        function () {
          return children;
        },
        function (index) {
          return children.slice(0, index);
        }
      );
    };

    var extractChildren = function (block) {
      var children = getChildrenUntilBlockBoundary(block);

      Arr.each(children, function (node) {
        Remove.remove(node);
      });

      return children;
    };

    var trimBr = function (first, block) {
      CaretFinder.positionIn(first, block.dom()).each(function (position) {
        var node = position.getNode();
        if (NodeType.isBr(node)) {
          Remove.remove(Element.fromDom(node));
        }
      });
    };

    var removeEmptyRoot = function (rootNode, block) {
      var parents = Parents.parentsAndSelf(block, rootNode);
      return Arr.find(parents.reverse(), Empty.isEmpty).each(Remove.remove);
    };

    var findParentInsertPoint = function (toBlock, block) {
      var parents = Traverse.parents(block, function (elm) {
        return Compare.eq(elm, toBlock);
      });

      return Option.from(parents[parents.length - 2]);
    };

    var getInsertionPoint = function (fromBlock, toBlock) {
      if (Compare.contains(toBlock, fromBlock)) {
        return Traverse.parent(fromBlock).bind(function (parent) {
          return Compare.eq(parent, toBlock) ? Option.some(fromBlock) : findParentInsertPoint(toBlock, fromBlock);
        });
      } else {
        return Option.none();
      }
    };

    var mergeBlockInto = function (rootNode, fromBlock, toBlock) {
      if (Empty.isEmpty(toBlock)) {
        Remove.remove(toBlock);
        return CaretFinder.firstPositionIn(fromBlock.dom());
      } else {
        trimBr(true, fromBlock);
        trimBr(false, toBlock);

        var children = extractChildren(fromBlock);

        return getInsertionPoint(fromBlock, toBlock).fold(
          function () {
            removeEmptyRoot(rootNode, fromBlock);

            var position = CaretFinder.lastPositionIn(toBlock.dom());

            Arr.each(children, function (node) {
              Insert.append(toBlock, node);
            });

            return position;
          },
          function (target) {
            var position = CaretFinder.prevPosition(toBlock.dom(), CaretPosition.before(target.dom()));

            Arr.each(children, function (node) {
              Insert.before(target, node);
            });

            removeEmptyRoot(rootNode, fromBlock);

            return position;
          }
        );
      }
    };

    var mergeBlocks = function (rootNode, forward, block1, block2) {
      return forward ? mergeBlockInto(rootNode, block2, block1) : mergeBlockInto(rootNode, block1, block2);
    };

    return {
      mergeBlocks: mergeBlocks
    };
  }
);
