/**
 * EditorSelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Shim layer between sugar and tinymce selection.
 */
define(
  'tinymce.core.EditorSelection',
  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element'
  ],
  function (Option, Element) {
    var select = function (editor, element) {
      editor.selection.select(element.dom());
    };

    var selectContents = function (editor, element) {
      editor.selection.select(element.dom(), true);
    };

    var setRawRange = function (editor, range) {
      editor.selection.setRng(range);
    };

    var getRawRange = function (editor, range) {
      return Option.from(editor.selection.getRng()).map(Element.fromDom);
    };

    var getSelectedElement = function (editor) {
      return Option.from(editor.selection.getNode()).map(Element.fromDom);
    };

    return {
      select: select,
      selectContents: selectContents,
      setRawRange: setRawRange,
      getRawRange: getRawRange,
      getSelectedElement: getSelectedElement
    };
  }
);