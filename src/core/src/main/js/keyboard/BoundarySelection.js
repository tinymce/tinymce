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
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'tinymce.core.caret.CaretContainerRemove',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.keyboard.BoundaryCaret',
    'tinymce.core.keyboard.BoundaryLocation',
    'tinymce.core.keyboard.InlineUtils'
  ],
  function (Arr, Cell, Fun, CaretContainerRemove, CaretPosition, BoundaryCaret, BoundaryLocation, InlineUtils) {
    var setCaretPosition = function (editor, pos) {
      var rng = editor.dom.createRng();
      rng.setStart(pos.container(), pos.offset());
      rng.setEnd(pos.container(), pos.offset());
      editor.selection.setRng(rng);
    };

    var isFeatureEnabled = function (editor) {
      return editor.settings.inline_boundaries !== false;
    };

    var setSelected = function (state, elm) {
      if (state) {
        elm.setAttribute('data-mce-selected', '1');
      } else {
        elm.removeAttribute('data-mce-selected', '1');
      }
    };

    var renderCaretLocation = function (editor, caret, location) {
      return BoundaryCaret.renderCaret(caret, location).map(function (pos) {
        setCaretPosition(editor, pos);
        return location;
      });
    };

    var findLocation = function (editor, caret, forward) {
      var rootNode = editor.getBody();
      var from = CaretPosition.fromRangeStart(editor.selection.getRng());
      var location = forward ? BoundaryLocation.nextLocation(rootNode, from) : BoundaryLocation.prevLocation(rootNode, from);
      return location.bind(function (location) {
        return renderCaretLocation(editor, caret, location);
      });
    };

    var toggleInlines = function (dom, elms) {
      var selectedInlines = dom.select('a[href][data-mce-selected],code[data-mce-selected]');
      var targetInlines = Arr.filter(elms, InlineUtils.isInlineTarget);
      Arr.each(Arr.difference(selectedInlines, targetInlines), Fun.curry(setSelected, false));
      Arr.each(Arr.difference(targetInlines, selectedInlines), Fun.curry(setSelected, true));
    };

    var safeRemoveCaretContainer = function (editor, caret) {
      if (editor.selection.isCollapsed() && editor.composing !== true && caret.get()) {
        var pos = CaretPosition.fromRangeStart(editor.selection.getRng());
        if (CaretPosition.isTextPosition(pos) && InlineUtils.isAtZwsp(pos) === false) {
          setCaretPosition(editor, CaretContainerRemove.removeAndReposition(caret.get(), pos));
          caret.set(null);
        }
      }
    };

    var renderInsideInlineCaret = function (editor, caret, elms) {
      if (editor.selection.isCollapsed()) {
        var inlines = Arr.filter(elms, InlineUtils.isInlineTarget);
        Arr.each(inlines, function (inline) {
          var pos = CaretPosition.fromRangeStart(editor.selection.getRng());
          BoundaryLocation.readLocation(editor.getBody(), pos).bind(function (location) {
            return renderCaretLocation(editor, caret, location);
          });
        });
      }
    };

    var move = function (editor, caret, forward) {
      return function () {
        return isFeatureEnabled(editor) ? findLocation(editor, caret, forward).isSome() : false;
      };
    };

    var setupSelectedState = function (editor) {
      var caret = new Cell(null);

      editor.on('NodeChange', function (e) {
        if (isFeatureEnabled(editor)) {
          toggleInlines(editor.dom, e.parents);
          safeRemoveCaretContainer(editor, caret);
          renderInsideInlineCaret(editor, caret, e.parents);
        }
      });

      return caret;
    };

    return {
      move: move,
      setupSelectedState: setupSelectedState,
      setCaretPosition: setCaretPosition
    };
  }
);