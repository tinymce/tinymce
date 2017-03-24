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

    var fromPositionOrReverse = function (forward, rootElement, position) {
      return fromPosition(forward, rootElement, position).fold(
        function () {
          return fromPosition(!forward, rootElement, position);
        },
        Option.some
      );
    };

    var positionIn = function (forward, element) {
      var caretWalker = new CaretWalker(element);
      var startPos = forward ? CaretPosition.before(element) : CaretPosition.after(element);
      return Option.from(forward ? caretWalker.next(startPos) : caretWalker.prev(startPos));
    };

    var fromElement = function (forward, rootElement, element) {
      var position = forward ? CaretPosition.after(element) : CaretPosition.before(element);
      return fromPosition(forward, rootElement, position);
    };

    var fromElementOrReverse = function (forward, rootElement, element) {
      return fromElement(forward, rootElement, element).fold(
        function () {
          return fromElement(!forward, rootElement, element);
        },
        Option.some
      );
    };

    return {
      fromPosition: fromPosition,
      fromPositionOrReverse: fromPositionOrReverse,
      forward: Fun.curry(fromPosition, true),
      backward: Fun.curry(fromPosition, false),
      positionIn: positionIn,

      fromElement: fromElement,
      fromElementOrReverse: fromElementOrReverse,
      forwardFromElement: Fun.curry(fromElement, true),
      backwardFromElement: Fun.curry(fromElement, false)
    };
  }
);
