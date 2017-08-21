/**
 * CefNavigation.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.CefNavigation',
  [
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.caret.CaretWalker',
    'tinymce.core.caret.LineUtils',
    'tinymce.core.caret.LineWalker',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.RangeUtils',
    'tinymce.core.Env',
    'tinymce.core.keyboard.CefUtils',
    'tinymce.core.util.Arr',
    'tinymce.core.util.Fun'
  ],
  function (CaretContainer, CaretPosition, CaretUtils, CaretWalker, LineUtils, LineWalker, NodeType, RangeUtils, Env, CefUtils, Arr, Fun) {
    var isContentEditableFalse = NodeType.isContentEditableFalse;
    var getSelectedNode = RangeUtils.getSelectedNode;
    var isAfterContentEditableFalse = CaretUtils.isAfterContentEditableFalse;
    var isBeforeContentEditableFalse = CaretUtils.isBeforeContentEditableFalse;

    var getVisualCaretPosition = function (walkFn, caretPosition) {
      while ((caretPosition = walkFn(caretPosition))) {
        if (caretPosition.isVisible()) {
          return caretPosition;
        }
      }

      return caretPosition;
    };

    var isMoveInsideSameBlock = function (fromCaretPosition, toCaretPosition) {
      var inSameBlock = CaretUtils.isInSameBlock(fromCaretPosition, toCaretPosition);

      // Handle bogus BR <p>abc|<br></p>
      if (!inSameBlock && NodeType.isBr(fromCaretPosition.getNode())) {
        return true;
      }

      return inSameBlock;
    };

    var isRangeInCaretContainerBlock = function (range) {
      return CaretContainer.isCaretContainerBlock(range.startContainer);
    };

    var getNormalizedRangeEndPoint = function (direction, rootNode, range) {
      range = CaretUtils.normalizeRange(direction, rootNode, range);

      if (direction === -1) {
        return CaretPosition.fromRangeStart(range);
      }

      return CaretPosition.fromRangeEnd(range);
    };

    var moveToCeFalseHorizontally = function (direction, editor, getNextPosFn, isBeforeContentEditableFalseFn, range) {
      var node, caretPosition, peekCaretPosition, rangeIsInContainerBlock;

      if (!range.collapsed) {
        node = getSelectedNode(range);
        if (isContentEditableFalse(node)) {
          return CefUtils.showCaret(direction, editor, node, direction === -1);
        }
      }

      rangeIsInContainerBlock = isRangeInCaretContainerBlock(range);
      caretPosition = getNormalizedRangeEndPoint(direction, editor.getBody(), range);

      if (isBeforeContentEditableFalseFn(caretPosition)) {
        return CefUtils.selectNode(editor, caretPosition.getNode(direction === -1));
      }

      caretPosition = getNextPosFn(caretPosition);
      if (!caretPosition) {
        if (rangeIsInContainerBlock) {
          return range;
        }

        return null;
      }

      if (isBeforeContentEditableFalseFn(caretPosition)) {
        return CefUtils.showCaret(direction, editor, caretPosition.getNode(direction === -1), direction === 1);
      }

      // Peek ahead for handling of ab|c<span cE=false> -> abc|<span cE=false>
      peekCaretPosition = getNextPosFn(caretPosition);
      if (isBeforeContentEditableFalseFn(peekCaretPosition)) {
        if (isMoveInsideSameBlock(caretPosition, peekCaretPosition)) {
          return CefUtils.showCaret(direction, editor, peekCaretPosition.getNode(direction === -1), direction === 1);
        }
      }

      if (rangeIsInContainerBlock) {
        return CefUtils.renderRangeCaret(editor, caretPosition.toRange());
      }

      return null;
    };

    var moveToCeFalseVertically = function (direction, editor, walkerFn, range) {
      var caretPosition, linePositions, nextLinePositions,
        closestNextLineRect, caretClientRect, clientX,
        dist1, dist2, contentEditableFalseNode;

      contentEditableFalseNode = getSelectedNode(range);
      caretPosition = getNormalizedRangeEndPoint(direction, editor.getBody(), range);
      linePositions = walkerFn(editor.getBody(), LineWalker.isAboveLine(1), caretPosition);
      nextLinePositions = Arr.filter(linePositions, LineWalker.isLine(1));
      caretClientRect = Arr.last(caretPosition.getClientRects());

      if (isBeforeContentEditableFalse(caretPosition)) {
        contentEditableFalseNode = caretPosition.getNode();
      }

      if (isAfterContentEditableFalse(caretPosition)) {
        contentEditableFalseNode = caretPosition.getNode(true);
      }

      if (!caretClientRect) {
        return null;
      }

      clientX = caretClientRect.left;

      closestNextLineRect = LineUtils.findClosestClientRect(nextLinePositions, clientX);
      if (closestNextLineRect) {
        if (isContentEditableFalse(closestNextLineRect.node)) {
          dist1 = Math.abs(clientX - closestNextLineRect.left);
          dist2 = Math.abs(clientX - closestNextLineRect.right);

          return CefUtils.showCaret(direction, editor, closestNextLineRect.node, dist1 < dist2);
        }
      }

      if (contentEditableFalseNode) {
        var caretPositions = LineWalker.positionsUntil(direction, editor.getBody(), LineWalker.isAboveLine(1), contentEditableFalseNode);

        closestNextLineRect = LineUtils.findClosestClientRect(Arr.filter(caretPositions, LineWalker.isLine(1)), clientX);
        if (closestNextLineRect) {
          return CefUtils.renderRangeCaret(editor, closestNextLineRect.position.toRange());
        }

        closestNextLineRect = Arr.last(Arr.filter(caretPositions, LineWalker.isLine(0)));
        if (closestNextLineRect) {
          return CefUtils.renderRangeCaret(editor, closestNextLineRect.position.toRange());
        }
      }
    };

    var createTextBlock = function (editor) {
      var textBlock = editor.dom.create(editor.settings.forced_root_block);

      if (!Env.ie || Env.ie >= 11) {
        textBlock.innerHTML = '<br data-mce-bogus="1">';
      }

      return textBlock;
    };

    var exitPreBlock = function (editor, direction, range) {
      var pre, caretPos, newBlock;
      var caretWalker = new CaretWalker(editor.getBody());
      var getNextVisualCaretPosition = Fun.curry(getVisualCaretPosition, caretWalker.next);
      var getPrevVisualCaretPosition = Fun.curry(getVisualCaretPosition, caretWalker.prev);

      if (range.collapsed && editor.settings.forced_root_block) {
        pre = editor.dom.getParent(range.startContainer, 'PRE');
        if (!pre) {
          return;
        }

        if (direction === 1) {
          caretPos = getNextVisualCaretPosition(CaretPosition.fromRangeStart(range));
        } else {
          caretPos = getPrevVisualCaretPosition(CaretPosition.fromRangeStart(range));
        }

        if (!caretPos) {
          newBlock = createTextBlock(editor);

          if (direction === 1) {
            editor.$(pre).after(newBlock);
          } else {
            editor.$(pre).before(newBlock);
          }

          editor.selection.select(newBlock, true);
          editor.selection.collapse();
        }
      }
    };

    var getHorizontalRange = function (editor, forward) {
      var caretWalker = new CaretWalker(editor.getBody());
      var getNextVisualCaretPosition = Fun.curry(getVisualCaretPosition, caretWalker.next);
      var getPrevVisualCaretPosition = Fun.curry(getVisualCaretPosition, caretWalker.prev);
      var newRange, direction = forward ? 1 : -1;
      var getNextPosFn = forward ? getNextVisualCaretPosition : getPrevVisualCaretPosition;
      var isBeforeContentEditableFalseFn = forward ? isBeforeContentEditableFalse : isAfterContentEditableFalse;
      var range = editor.selection.getRng();

      newRange = moveToCeFalseHorizontally(direction, editor, getNextPosFn, isBeforeContentEditableFalseFn, range);
      if (newRange) {
        return newRange;
      }

      newRange = exitPreBlock(editor, direction, range);
      if (newRange) {
        return newRange;
      }

      return null;
    };

    var getVerticalRange = function (editor, down) {
      var newRange, direction = down ? 1 : -1;
      var walkerFn = down ? LineWalker.downUntil : LineWalker.upUntil;
      var range = editor.selection.getRng();

      newRange = moveToCeFalseVertically(direction, editor, walkerFn, range);
      if (newRange) {
        return newRange;
      }

      newRange = exitPreBlock(editor, direction, range);
      if (newRange) {
        return newRange;
      }

      return null;
    };

    var moveH = function (editor, forward) {
      return function () {
        var newRng = getHorizontalRange(editor, forward);

        if (newRng) {
          editor.selection.setRng(newRng);
          return true;
        } else {
          return false;
        }
      };
    };

    var moveV = function (editor, down) {
      return function () {
        var newRng = getVerticalRange(editor, down);

        if (newRng) {
          editor.selection.setRng(newRng);
          return true;
        } else {
          return false;
        }
      };
    };

    return {
      moveH: moveH,
      moveV: moveV
    };
  }
);
