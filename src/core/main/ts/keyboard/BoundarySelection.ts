/**
 * BoundarySelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr } from '@ephox/katamari';
import { Cell } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import CaretContainerRemove from '../caret/CaretContainerRemove';
import CaretPosition from '../caret/CaretPosition';
import BoundaryCaret from './BoundaryCaret';
import BoundaryLocation from './BoundaryLocation';
import InlineUtils from './InlineUtils';
import WordSelection from '../selection/WordSelection';

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
    elm.setAttribute('data-mce-selected', 'inline-boundary');
  } else {
    elm.removeAttribute('data-mce-selected');
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
  var isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);
  var location = BoundaryLocation.findLocation(forward, isInlineTarget, rootNode, from);
  return location.bind(function (location) {
    return renderCaretLocation(editor, caret, location);
  });
};

var toggleInlines = function (isInlineTarget, dom, elms) {
  var selectedInlines = Arr.filter(dom.select('*[data-mce-selected="inline-boundary"]'), isInlineTarget);
  var targetInlines = Arr.filter(elms, isInlineTarget);
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

var renderInsideInlineCaret = function (isInlineTarget, editor, caret, elms) {
  if (editor.selection.isCollapsed()) {
    var inlines = Arr.filter(elms, isInlineTarget);
    Arr.each(inlines, function (inline) {
      var pos = CaretPosition.fromRangeStart(editor.selection.getRng());
      BoundaryLocation.readLocation(isInlineTarget, editor.getBody(), pos).bind(function (location) {
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

var moveWord = function (forward, editor, caret) {
  return function () {
    return isFeatureEnabled(editor) ? WordSelection.moveByWord(forward, editor) : false;
  };
};

var setupSelectedState = function (editor) {
  var caret = new Cell(null);
  var isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);

  editor.on('NodeChange', function (e) {
    if (isFeatureEnabled(editor)) {
      toggleInlines(isInlineTarget, editor.dom, e.parents);
      safeRemoveCaretContainer(editor, caret);
      renderInsideInlineCaret(isInlineTarget, editor, caret, e.parents);
    }
  });

  return caret;
};

export default {
  move: move,
  moveNextWord: Fun.curry(moveWord, true),
  movePrevWord: Fun.curry(moveWord, false),
  setupSelectedState: setupSelectedState,
  setCaretPosition: setCaretPosition
};