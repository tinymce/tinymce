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
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Options',
    'ephox.katamari.api.Struct',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition'
  ],
  function (Fun, Option, Options, Struct, CaretFinder, CaretPosition) {
    var BlockPosition = Struct.immutable('block', 'position');
    var BlockBoundary = Struct.immutable('from', 'to');

    var isTextBlock = function (editor, node) {
      return node && editor.schema.getTextBlockElements().hasOwnProperty(node.nodeName);
    };

    var getParentTextBlock = function (editor, node) {
      return Option.from(editor.dom.getParent(node, Fun.curry(isTextBlock, editor)));
    };

    var getBlockPosition = function (editor, pos) {
      return getParentTextBlock(editor, pos.container()).map(function (block) {
        return BlockPosition(block, pos);
      });
    };

    var readBlockBoundary = function (editor, forward) {
      var rootNode = editor.getBody();
      var fromBlockPos = getBlockPosition(editor, CaretPosition.fromRangeStart(editor.selection.getRng()));
      var toBlockPos = fromBlockPos.bind(function (blockPos) {
        return CaretFinder.fromPosition(forward, rootNode, blockPos.position()).bind(function (to) {
          return getBlockPosition(editor, to);
        });
      });

      return Options.liftN([fromBlockPos, toBlockPos], BlockBoundary).filter(function (blockBoundary) {
        return blockBoundary.from().block() !== blockBoundary.to().block();
      });
    };

    return {
      readBlockBoundary: readBlockBoundary
    };
  }
);
