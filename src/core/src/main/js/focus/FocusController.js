/**
 * FocusController.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.focus.FocusController',
  [
    'ephox.katamari.api.Fun',
    'global!document',
    'tinymce.core.api.FocusManager',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.selection.SelectionRestore',
    'tinymce.core.util.Delay'
  ],
  function (Fun, document, FocusManager, DOMUtils, SelectionRestore, Delay) {
    var documentFocusInHandler, DOM = DOMUtils.DOM;

    var isEditorUIElement = function (elm) {
      // Since this can be overridden by third party we need to use the API reference here
      return FocusManager.isEditorUIElement(elm);
    };

    var isUIElement = function (editor, elm) {
      var customSelector = editor ? editor.settings.custom_ui_selector : '';
      var parent = DOM.getParent(elm, function (elm) {
        return (
          isEditorUIElement(elm) ||
          (customSelector ? editor.dom.is(elm, customSelector) : false)
        );
      });
      return parent !== null;
    };

    var getActiveElement = function () {
      try {
        return document.activeElement;
      } catch (ex) {
        // IE sometimes fails to get the activeElement when resizing table
        // TODO: Investigate this
        return document.body;
      }
    };

    var registerEvents = function (editorManager, e) {
      var editor = e.editor;

      SelectionRestore.register(editor);

      editor.on('focusin', function () {
        var focusedEditor = editorManager.focusedEditor;

        if (focusedEditor != editor) {
          if (focusedEditor) {
            focusedEditor.fire('blur', { focusedEditor: editor });
          }

          editorManager.setActive(editor);
          editorManager.focusedEditor = editor;
          editor.fire('focus', { blurredEditor: focusedEditor });
          editor.focus(true);
        }
      });

      editor.on('focusout', function () {
        Delay.setEditorTimeout(editor, function () {
          var focusedEditor = editorManager.focusedEditor;

          // Still the same editor the blur was outside any editor UI
          if (!isUIElement(editor, getActiveElement()) && focusedEditor == editor) {
            editor.fire('blur', { focusedEditor: null });
            editorManager.focusedEditor = null;
          }
        });
      });

      // Check if focus is moved to an element outside the active editor by checking if the target node
      // isn't within the body of the activeEditor nor a UI element such as a dialog child control
      if (!documentFocusInHandler) {
        documentFocusInHandler = function (e) {
          var activeEditor = editorManager.activeEditor, target;

          target = e.target;

          if (activeEditor && target.ownerDocument === document) {
            // Fire a blur event if the element isn't a UI element
            if (target !== document.body && !isUIElement(activeEditor, target) && editorManager.focusedEditor === activeEditor) {
              activeEditor.fire('blur', { focusedEditor: null });
              editorManager.focusedEditor = null;
            }
          }
        };

        DOM.bind(document, 'focusin', documentFocusInHandler);
      }
    };

    var unregisterDocumentEvents = function (editorManager, e) {
      if (editorManager.focusedEditor == e.editor) {
        editorManager.focusedEditor = null;
      }

      if (!editorManager.activeEditor) {
        DOM.unbind(document, 'focusin', documentFocusInHandler);
        documentFocusInHandler = null;
      }
    };

    var setup = function (editorManager) {
      editorManager.on('AddEditor', Fun.curry(registerEvents, editorManager));
      editorManager.on('RemoveEditor', Fun.curry(unregisterDocumentEvents, editorManager));
    };

    return {
      setup: setup,
      isEditorUIElement: isEditorUIElement,
      isUIElement: isUIElement
    };
  }
);
