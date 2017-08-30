/**
 * BlockBoundary.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.BlockBoundary',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Options',
    'ephox.katamari.api.Struct',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.PredicateFind',
    'ephox.sugar.api.search.Traverse',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.delete.DeleteUtils',
    'tinymce.core.dom.Empty',
    'tinymce.core.dom.NodeType'
  ],
  function (Arr, Fun, Option, Options, Struct, Compare, Element, Node, PredicateFind, Traverse, CaretFinder, CaretPosition, DeleteUtils, Empty, NodeType) {
    var BlockPosition = Struct.immutable('block', 'position');
    var BlockBoundary = Struct.immutable('from', 'to');

    var getBlockPosition = function (rootNode, pos) {
      var rootElm = Element.fromDom(rootNode);
      var containerElm = Element.fromDom(pos.container());
      return DeleteUtils.getParentBlock(rootElm, containerElm).map(function (block) {
        return BlockPosition(block, pos);
      });
    };

    var isDifferentBlocks = function (blockBoundary) {
      return Compare.eq(blockBoundary.from().block(), blockBoundary.to().block()) === false;
    };

    var hasSameParent = function (blockBoundary) {
      return Traverse.parent(blockBoundary.from().block()).bind(function (parent1) {
        return Traverse.parent(blockBoundary.to().block()).filter(function (parent2) {
          return Compare.eq(parent1, parent2);
        });
      }).isSome();
    };

    var isEditable = function (blockBoundary) {
      return NodeType.isContentEditableFalse(blockBoundary.from().block()) === false && NodeType.isContentEditableFalse(blockBoundary.to().block()) === false;
    };

    var skipLastBr = function (rootNode, forward, blockPosition) {
      if (NodeType.isBr(blockPosition.position().getNode()) && Empty.isEmpty(blockPosition.block()) === false) {
        return CaretFinder.positionIn(false, blockPosition.block().dom()).bind(function (lastPositionInBlock) {
          if (lastPositionInBlock.isEqual(blockPosition.position())) {
            return CaretFinder.fromPosition(forward, rootNode, lastPositionInBlock).bind(function (to) {
              return getBlockPosition(rootNode, to);
            });
          } else {
            return Option.some(blockPosition);
          }
        }).getOr(blockPosition);
      } else {
        return blockPosition;
      }
    };

    var readFromRange = function (rootNode, forward, rng) {
      var fromBlockPos = getBlockPosition(rootNode, CaretPosition.fromRangeStart(rng));
      var toBlockPos = fromBlockPos.bind(function (blockPos) {
        return CaretFinder.fromPosition(forward, rootNode, blockPos.position()).bind(function (to) {
          return getBlockPosition(rootNode, to).map(function (blockPos) {
            return skipLastBr(rootNode, forward, blockPos);
          });
        });
      });

      return Options.liftN([fromBlockPos, toBlockPos], BlockBoundary).filter(function (blockBoundary) {
        return isDifferentBlocks(blockBoundary) && hasSameParent(blockBoundary) && isEditable(blockBoundary);
      });
    };

    var read = function (rootNode, forward, rng) {
      return rng.collapsed ? readFromRange(rootNode, forward, rng) : Option.none();
    };

    return {
      read: read
    };
  }
);
