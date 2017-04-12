/**
 * DeleteElement.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.DeleteElement',
  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Remove',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.keyboard.InlineUtils'
  ],
  function (Option, Remove, CaretPosition, InlineUtils) {
    var start = function (elm) {
      return new CaretPosition(elm, 0);
    };

    var end = function (elm) {
      return new CaretPosition(elm, elm.childNodes.length);
    };

    var needsReposition = function (pos, elm) {
      var container = pos.container();
      var offset = pos.offset();
      return CaretPosition.isTextPosition(pos) === false && container === elm.parentNode && offset >= CaretPosition.before(elm).offset;
    };

    var findCaretPosOutsideElmAfterDelete = function (rootElement, elm) {
      return InlineUtils.findCaretPosition(rootElement, false, start(elm)).fold(
        function () {
          return InlineUtils.findCaretPosition(rootElement, true, end(elm));
        },
        Option.some
      ).map(function (pos) {
        if (CaretPosition.isTextPosition(pos) === false && pos.container() === elm.parentNode && pos.index >= CaretPosition.before(elm)) {
          return new CaretPosition(pos.container(), pos.index - 1);
        }

        return needsReposition(pos, elm) ? new CaretPosition(pos.container(), pos.index - 1) : pos;
      });
    };

    var setSelection = function (editor, pos) {
      pos.fold(
        function () {
          editor.focus();
        },
        function (pos) {
          editor.selection.setRng(pos.toRange());
        }
      );
    };

    var deleteElement = function (editor, elm) {
      editor.undoManager.ignore(function () {
        var pos = findCaretPosOutsideElmAfterDelete(editor.getBody(), elm.dom());
        Remove.remove(elm);
        setSelection(editor, pos);
      });
    };

    return {
      deleteElement: deleteElement
    };
  }
);