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
  'tinymce.core.caret.CaretFinder',
  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretWalker'
  ],
  function (Fun, Option, CaretPosition, CaretWalker) {
    var fromPosition = function (forward, rootElement, position) {
      var walker = new CaretWalker(rootElement);
      return Option.from(forward ? walker.next(position) : walker.prev(position));
    };

    var positionIn = function (forward, element) {
      var caretWalker = new CaretWalker(element);
      var startPos = forward ? CaretPosition.before(element) : CaretPosition.after(element);
      return Option.from(forward ? caretWalker.next(startPos) : caretWalker.prev(startPos));
    };

    return {
      fromPosition: fromPosition,
      positionIn: positionIn
    };
  }
);
