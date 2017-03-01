/**
 * CaretFinder.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.CaretFinder',
  [
    'ephox.katamari.api.Option',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretWalker'
  ],
  function (Option, CaretContainer, CaretPosition, CaretWalker) {
    var findCaretPositionIn = function (node, forward) {
      var caretWalker = new CaretWalker(node);
      var startPos = forward ? CaretPosition.before(node) : CaretPosition.after(node);
      return Option.from(forward ? caretWalker.next(startPos) : caretWalker.prev(startPos));
    };

    var findCaretPosition = function (rootNode, from, forward) {
      var caretWalker = new CaretWalker(rootNode);
      return Option.from(forward ? caretWalker.next(from) : caretWalker.prev(from));
    };

    var normalize = function (forward, pos) {
      return Option.from(pos).map(function (pos) {
        var container = pos.container(), offset = pos.offset();

        if (forward) {
          return CaretContainer.isBeforeInline(pos) ? new CaretPosition(container, offset + 1) : pos;
        } else {
          return CaretContainer.isAfterInline(pos) ? new CaretPosition(container, offset - 1) : pos;
        }
      });
    };

    return {
      findCaretPositionIn: findCaretPositionIn,
      findCaretPosition: findCaretPosition,
      normalize: normalize
    };
  }
);