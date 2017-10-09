/**
 * FormatControls.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.ui.FormatControls',
  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.SelectorFind',
    'global!document',
    'tinymce.core.EditorManager',
    'tinymce.core.Env',
    'tinymce.ui.Control',
    'tinymce.ui.FloatPanel',
    'tinymce.ui.Widget',
    'tinymce.ui.editorui.Align',
    'tinymce.ui.editorui.FontSelect',
    'tinymce.ui.editorui.FontSizeSelect',
    'tinymce.ui.editorui.FormatSelect',
    'tinymce.ui.editorui.Formats',
    'tinymce.ui.editorui.InsertButton',
    'tinymce.ui.editorui.SimpleControls',
    'tinymce.ui.editorui.UndoRedo',
    'tinymce.ui.editorui.VisualAid'
  ],
  function (
    Fun, Element, SelectorFind, document, EditorManager, Env, Control, FloatPanel, Widget, Align, FontSelect, FontSizeSelect, FormatSelect, Formats, InsertButton,
    SimpleControls, UndoRedo, VisualAid
  ) {
    var setupEnvironment = function () {
      Widget.tooltips = !Env.iOS;

      Control.translate = function (text) {
        return EditorManager.translate(text);
      };
    };

    var setupUiContainer = function (editor) {
      if (editor.settings.ui_container) {
        Env.container = SelectorFind.descendant(Element.fromDom(document.body), editor.settings.ui_container).fold(Fun.constant(null), function (elm) {
          return elm.dom();
        });
      }
    };

    var setupRtlMode = function (editor) {
      if (editor.rtl) {
        Control.rtl = true;
      }
    };

    var setupHideFloatPanels = function (editor) {
      editor.on('mousedown', function () {
        FloatPanel.hideAll();
      });
    };

    var setup = function (editor) {
      setupRtlMode(editor);
      setupHideFloatPanels(editor);
      setupUiContainer(editor);
      setupEnvironment(editor);

      FormatSelect.register(editor);
      Align.register(editor);
      SimpleControls.register(editor);
      UndoRedo.register(editor);
      FontSizeSelect.register(editor);
      FontSelect.register(editor);
      Formats.register(editor);
      VisualAid.register(editor);
      InsertButton.register(editor);
    };

    return {
      setup: setup
    };
  }
);
