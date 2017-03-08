/**
 * BoundarySelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.BoundarySelection',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretContainerRemove',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.keyboard.BoundaryOperations',
    'tinymce.core.keyboard.InlineUtils',
    'tinymce.core.util.LazyEvaluator'
  ],
  function (Arr, Fun, CaretContainer, CaretContainerRemove, CaretPosition, BoundaryOperations, InlineUtils, LazyEvaluator) {
    var setCaretPosition = function (editor, pos) {
      var rng = editor.dom.createRng();
      rng.setStart(pos.container(), pos.offset());
      rng.setEnd(pos.container(), pos.offset());
      editor.selection.setRng(rng);
    };

    var moveOperation = function (editor, forward, from, to) {
      var operations = [
        BoundaryOperations.fromTextToOutsideInline,
        BoundaryOperations.fromTextInsideInlineToInlineEndPoint,
        BoundaryOperations.fromOutsideInlineToInsideInline,
        BoundaryOperations.fromInsideInlineToOutsideInline
      ];

      return LazyEvaluator.evaluateUntil(operations, [editor.getBody(), from, to, forward]);
    };

    var staticOperation = function (editor, forward, from) {
      return BoundaryOperations.staticOperation(editor, forward, from);
    };

    var setSelected = function (state, elm) {
      if (state) {
        elm.setAttribute('data-mce-selected', '1');
      } else {
        elm.removeAttribute('data-mce-selected', '1');
      }
    };

    var getNormalizedFromPosition = function (editor, forward) {
      return InlineUtils.normalize(forward, CaretPosition.fromRangeStart(editor.selection.getRng()));
    };

    var getNormalizedToPosition = function (editor, forward, from) {
      return InlineUtils.findCaretPosition(editor.getBody(), forward, from).bind(Fun.curry(InlineUtils.normalize, forward));
    };

    var getOperationFromSelection = function (editor, forward) {
      return getNormalizedFromPosition(editor, forward).bind(function (from) {
        return getNormalizedToPosition(editor, forward, from).fold(function () {
          return staticOperation(editor.getBody(), forward, from);
        }, function (to) {
          return moveOperation(editor, forward, from, to);
        });
      });
    };

    var move = function (editor, caret, forward) {
      return function () {
        return getOperationFromSelection(editor, forward)
          .map(Fun.curry(BoundaryOperations.applyOperation, caret))
          .map(function (pos) {
            setCaretPosition(editor, pos);
            return pos;
          }).isSome();
      };
    };

    var unselectInlines = function (editor) {
      Arr.each(editor.dom.select('a[href][data-mce-selected],code[data-mce-selected]'), Fun.curry(setSelected, false));
    };

    var selectInlines = function (elms) {
      Arr.find(elms, InlineUtils.isInlineTarget).bind(Fun.curry(setSelected, true));
    };

    var safeRemoveCaretContainer = function (editor, caret) {
      if (editor.selection.isCollapsed()) {
        var pos = CaretPosition.fromRangeStart(editor.selection.getRng());
        if (CaretPosition.isTextPosition(pos) && InlineUtils.isAtZwsp(pos) === false) {
          setCaretPosition(editor, CaretContainerRemove.removeAndReposition(caret.get(), pos));
          caret.set(null);
        }
      }
    };

    var setupSelectedState = function (editor, caret) {
      editor.on('NodeChange', function (e) {
        var pos = CaretPosition.fromRangeStart(editor.selection.getRng());

        unselectInlines(editor);
        selectInlines(e.parents);
        safeRemoveCaretContainer(editor, caret);

        if (editor.selection.isCollapsed()) {
          BoundaryOperations.getOperationFromPosition(e.parents, pos).map(function (operation) {
            setCaretPosition(editor, BoundaryOperations.applyOperation(caret, operation));
          });
        }
      });
    };

    return {
      move: move,
      setupSelectedState: setupSelectedState
    };
  }
);