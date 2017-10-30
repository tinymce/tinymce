/**
 * WordSelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.selection.WordSelection',
  [
    'ephox.katamari.api.Type',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretPosition'
  ],
  function (Type, CaretContainer, CaretPosition) {
    var hasSelectionModifyApi = function (editor) {
      return Type.isFunction(editor.selection.getSel().modify);
    };

    var moveRel = function (forward, selection, pos) {
      var delta = forward ? 1 : -1;
      selection.setRng(CaretPosition(pos.container(), pos.offset() + delta).toRange());
      selection.getSel().modify('move', forward ? 'forward' : 'backward', 'word');
      return true;
    };

    var moveByWord = function (forward, editor) {
      var rng = editor.selection.getRng();
      var pos = forward ? CaretPosition.fromRangeEnd(rng) : CaretPosition.fromRangeStart(rng);

      if (!hasSelectionModifyApi(editor)) {
        return false;
      } else if (forward && CaretContainer.isBeforeInline(pos)) {
        return moveRel(true, editor.selection, pos);
      } else if (!forward && CaretContainer.isAfterInline(pos)) {
        return moveRel(false, editor.selection, pos);
      } else {
        return false;
      }
    };

    return {
      hasSelectionModifyApi: hasSelectionModifyApi,
      moveByWord: moveByWord
    };
  }
);