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
    'tinymce.core.caret.CaretCandidate',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretWalker',
    'tinymce.core.dom.NodeType'
  ],
  function (Fun, Option, CaretCandidate, CaretPosition, CaretWalker, NodeType) {
    var fromPosition = function (forward, rootElement, position) {
      var walker = new CaretWalker(rootElement);
      return Option.from(forward ? walker.next(position) : walker.prev(position));
    };

    var walkToPositionIn = function (forward, rootNode, startNode) {
      var caretWalker = new CaretWalker(rootNode);
      var startPos = forward ? CaretPosition.before(startNode) : CaretPosition.after(startNode);
      return Option.from(forward ? caretWalker.next(startPos) : caretWalker.prev(startPos));
    };

    var afterElement = function (node) {
      return NodeType.isBr(node) ? CaretPosition.before(node) : CaretPosition.after(node);
    };

    var positionIn = function (forward, element) {
      var startNode = forward ? element.firstChild : element.lastChild;
      if (NodeType.isText(startNode)) {
        return Option.some(new CaretPosition(startNode, forward ? 0 : startNode.data.length));
      } else if (startNode) {
        if (CaretCandidate.isCaretCandidate(startNode)) {
          return Option.some(forward ? CaretPosition.before(startNode) : afterElement(startNode));
        } else {
          return walkToPositionIn(forward, element, startNode);
        }
      } else {
        return Option.none();
      }
    };

    return {
      fromPosition: fromPosition,
      positionIn: positionIn
    };
  }
);
