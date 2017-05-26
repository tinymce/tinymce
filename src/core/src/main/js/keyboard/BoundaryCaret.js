/**
 * BoundaryCaret.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.BoundaryCaret',
  [
    'ephox.katamari.api.Option',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretContainerInline',
    'tinymce.core.caret.CaretContainerRemove',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.NodeType',
    'tinymce.core.keyboard.InlineUtils'
  ],
  function (Option, CaretContainer, CaretContainerInline, CaretContainerRemove, CaretPosition, NodeType, InlineUtils) {
    var insertInlinePos = function (pos, before) {
      if (NodeType.isText(pos.container())) {
        return CaretContainerInline.insertInline(before, pos.container());
      } else {
        return CaretContainerInline.insertInline(before, pos.getNode());
      }
    };

    var isPosCaretContainer = function (pos, caret) {
      var caretNode = caret.get();
      return caretNode && pos.container() === caretNode && CaretContainer.isCaretContainerInline(caretNode);
    };

    var renderCaret = function (caret, location) {
      return location.fold(
        function (element) { // Before
          CaretContainerRemove.remove(caret.get());
          var text = CaretContainerInline.insertInlineBefore(element);
          caret.set(text);
          return Option.some(new CaretPosition(text, text.length - 1));
        },
        function (element) { // Start
          return InlineUtils.findCaretPositionIn(element, true).map(function (pos) {
            if (!isPosCaretContainer(pos, caret)) {
              CaretContainerRemove.remove(caret.get());
              var text = insertInlinePos(pos, true);
              caret.set(text);
              return new CaretPosition(text, 1);
            } else {
              return new CaretPosition(caret.get(), 1);
            }
          });
        },
        function (element) { // End
          return InlineUtils.findCaretPositionIn(element, false).map(function (pos) {
            if (!isPosCaretContainer(pos, caret)) {
              CaretContainerRemove.remove(caret.get());
              var text = insertInlinePos(pos, false);
              caret.set(text);
              return new CaretPosition(text, text.length - 1);
            } else {
              return new CaretPosition(caret.get(), caret.get().length - 1);
            }
          });
        },
        function (element) { // After
          CaretContainerRemove.remove(caret.get());
          var text = CaretContainerInline.insertInlineAfter(element);
          caret.set(text);
          return Option.some(new CaretPosition(text, 1));
        }
      );
    };

    return {
      renderCaret: renderCaret
    };
  }
);