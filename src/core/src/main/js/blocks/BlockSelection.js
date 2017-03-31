/**
 * BlockSelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.blocks.BlockSelection',
  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'tinymce.core.blocks.BlockDom',
    'tinymce.core.caret.CaretFinder'
  ],
  function (Option, Element, BlockDom, CaretFinder) {
    var select = function (rootElement, uuid) {
      return BlockDom.findByGuid(rootElement, uuid);
    };

    var unselect = function (rootElement, selectedElement, forward) {
      return BlockDom.findParentBlock(rootElement, selectedElement)
        .bind(function (blockElement) {
          return CaretFinder.fromElementOrReverse(forward, rootElement.dom(), blockElement.dom());
        }).map(function (pos) {
          return pos.toRange();
        });
    };

    var getBlockContainer = function (editor, container) {
      var rootElement = Element.fromDom(editor.getBody());

      return BlockDom.findParentBlock(rootElement, container).bind(function (block) {
        return BlockDom.getSpec(editor, block).bind(function (spec) {
          return spec.type() === 'unmanaged' ? Option.some(block) : Option.none();
        });
      });
    };

    var excludeUnmanagedBlocks = function (editor, range) {
      var startBlock = getBlockContainer(editor, Element.fromDom(range.startContainer));
      var endBlock = getBlockContainer(editor, Element.fromDom(range.startContainer));
      var outRange = range.cloneRange();

      startBlock.map(function (block) {
        if (endBlock.isNone()) {
          outRange.setStartAfter(block.dom());
        } else {
          outRange.setStartBefore(block.dom());
        }
      });

      endBlock.map(function (block) {
        if (startBlock.isNone()) {
          outRange.setEndBefore(block.dom());
        } else {
          outRange.setEndAfter(block.dom());
        }
      });

      return outRange;
    };

    var setup = function (editor) {
      editor.on('GetSelectionRange', function (e) {
        e.range = excludeUnmanagedBlocks(editor, e.range);
      });
    };

    return {
      select: select,
      unselect: unselect,
      setup: setup
    };
  }
);
