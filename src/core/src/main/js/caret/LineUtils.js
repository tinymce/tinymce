/**
 * LineUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Utility functions for working with lines.
 *
 * @private
 * @class tinymce.caret.LineUtils
 */
define(
  'tinymce.core.caret.LineUtils',
  [
    "tinymce.core.util.Fun",
    "tinymce.core.util.Arr",
    "tinymce.core.dom.NodeType",
    "tinymce.core.dom.Dimensions",
    "tinymce.core.geom.ClientRect",
    "tinymce.core.caret.CaretUtils",
    "tinymce.core.caret.CaretCandidate"
  ],
  function (Fun, Arr, NodeType, Dimensions, ClientRect, CaretUtils, CaretCandidate) {
    var isContentEditableFalse = NodeType.isContentEditableFalse,
      findNode = CaretUtils.findNode,
      curry = Fun.curry;

    function distanceToRectLeft(clientRect, clientX) {
      return Math.abs(clientRect.left - clientX);
    }

    function distanceToRectRight(clientRect, clientX) {
      return Math.abs(clientRect.right - clientX);
    }

    function findClosestClientRect(clientRects, clientX) {
      function isInside(clientX, clientRect) {
        return clientX >= clientRect.left && clientX <= clientRect.right;
      }

      return Arr.reduce(clientRects, function (oldClientRect, clientRect) {
        var oldDistance, newDistance;

        oldDistance = Math.min(distanceToRectLeft(oldClientRect, clientX), distanceToRectRight(oldClientRect, clientX));
        newDistance = Math.min(distanceToRectLeft(clientRect, clientX), distanceToRectRight(clientRect, clientX));

        if (isInside(clientX, clientRect)) {
          return clientRect;
        }

        if (isInside(clientX, oldClientRect)) {
          return oldClientRect;
        }

        // cE=false has higher priority
        if (newDistance == oldDistance && isContentEditableFalse(clientRect.node)) {
          return clientRect;
        }

        if (newDistance < oldDistance) {
          return clientRect;
        }

        return oldClientRect;
      });
    }

    function walkUntil(direction, rootNode, predicateFn, node) {
      while ((node = findNode(node, direction, CaretCandidate.isEditableCaretCandidate, rootNode))) {
        if (predicateFn(node)) {
          return;
        }
      }
    }

    function findLineNodeRects(rootNode, targetNodeRect) {
      var clientRects = [];

      function collect(checkPosFn, node) {
        var lineRects;

        lineRects = Arr.filter(Dimensions.getClientRects(node), function (clientRect) {
          return !checkPosFn(clientRect, targetNodeRect);
        });

        clientRects = clientRects.concat(lineRects);

        return lineRects.length === 0;
      }

      clientRects.push(targetNodeRect);
      walkUntil(-1, rootNode, curry(collect, ClientRect.isAbove), targetNodeRect.node);
      walkUntil(1, rootNode, curry(collect, ClientRect.isBelow), targetNodeRect.node);

      return clientRects;
    }

    function getContentEditableFalseChildren(rootNode) {
      return Arr.filter(Arr.toArray(rootNode.getElementsByTagName('*')), isContentEditableFalse);
    }

    function caretInfo(clientRect, clientX) {
      return {
        node: clientRect.node,
        before: distanceToRectLeft(clientRect, clientX) < distanceToRectRight(clientRect, clientX)
      };
    }

    function closestCaret(rootNode, clientX, clientY) {
      var contentEditableFalseNodeRects, closestNodeRect;

      contentEditableFalseNodeRects = Dimensions.getClientRects(getContentEditableFalseChildren(rootNode));
      contentEditableFalseNodeRects = Arr.filter(contentEditableFalseNodeRects, function (clientRect) {
        return clientY >= clientRect.top && clientY <= clientRect.bottom;
      });

      closestNodeRect = findClosestClientRect(contentEditableFalseNodeRects, clientX);
      if (closestNodeRect) {
        closestNodeRect = findClosestClientRect(findLineNodeRects(rootNode, closestNodeRect), clientX);
        if (closestNodeRect && isContentEditableFalse(closestNodeRect.node)) {
          return caretInfo(closestNodeRect, clientX);
        }
      }

      return null;
    }

    return {
      findClosestClientRect: findClosestClientRect,
      findLineNodeRects: findLineNodeRects,
      closestCaret: closestCaret
    };
  }
);