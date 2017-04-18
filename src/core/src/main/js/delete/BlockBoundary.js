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
    'tinymce.core.dom.Empty',
    'tinymce.core.dom.NodeType'
  ],
  function (Arr, Fun, Option, Options, Struct, Compare, Element, Node, PredicateFind, Traverse, CaretFinder, CaretPosition, Empty, NodeType) {
    var BlockPosition = Struct.immutable('block', 'position');
    var BlockBoundary = Struct.immutable('from', 'to');

    var toLookup = function (names) {
      var lookup = Arr.foldl(names, function (acc, name) {
        acc[name] = true;
        return acc;
      }, { });

      return function (elm) {
        return lookup[Node.name(elm)] === true;
      };
    };

    var isTextBlock = toLookup([
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'address', 'pre', 'form', 'blockquote', 'center',
      'dir', 'fieldset', 'header', 'footer', 'article', 'section', 'hgroup', 'aside', 'nav', 'figure'
    ]);

    var isRoot = function (rootNode) {
      return function (elm) {
        return Compare.eq(Element.fromDom(rootNode), elm);
      };
    };

    var getParentTextBlock = function (rootNode, elm) {
      return PredicateFind.closest(Element.fromDom(elm), isTextBlock, isRoot(rootNode));
    };

    var getBlockPosition = function (rootNode, pos) {
      return getParentTextBlock(rootNode, pos.container()).map(function (block) {
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

    var read = function (rootNode, forward, rng) {
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

    return {
      read: read
    };
  }
);
