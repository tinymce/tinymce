/**
 * FocusManager.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class manages the focus/blur state of the editor. This class is needed since some
 * browsers fire false focus/blur states when the selection is moved to a UI dialog or similar.
 *
 * This class will fire two events focus and blur on the editor instances that got affected.
 * It will also handle the restore of selection when the focus is lost and returned.
 *
 * @class tinymce.FocusManager
 */
define(
  'tinymce.core.FocusManager',
  [
    'ephox.sugar.api.node.Element',
    'global!document',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.selection.SelectionBookmark',
    'tinymce.core.util.Delay'
  ],
  function (Element, document, DOMUtils, SelectionBookmark, Delay) {
    var selectionChangeHandler, documentFocusInHandler, documentMouseUpHandler, DOM = DOMUtils.DOM;

    var isUIElement = function (editor, elm) {
      var customSelector = editor ? editor.settings.custom_ui_selector : '';
      var parent = DOM.getParent(elm, function (elm) {
        return (
          FocusManager.isEditorUIElement(elm) ||
          (customSelector ? editor.dom.is(elm, customSelector) : false)
        );
      });
      return parent !== null;
    };

    /**
     * Constructs a new focus manager instance.
     *
     * @constructor FocusManager
     * @param {tinymce.EditorManager} editorManager Editor manager instance to handle focus for.
     */
    var FocusManager = function (editorManager) {
      var getActiveElement = function () {
        try {
          return document.activeElement;
        } catch (ex) {
          // IE sometimes fails to get the activeElement when resizing table
          // TODO: Investigate this
          return document.body;
        }
      };

      var registerEvents = function (e) {
        var editor = e.editor;

        editor.on('init', function () {
          editor.on('keyup mouseup touchend nodechange', function (e) {
            if (e.type === 'nodechange' && e.selectionChange) {
              return;
            }
            SelectionBookmark.store(editor);
          });
        });

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

      var unregisterDocumentEvents = function (e) {
        if (editorManager.focusedEditor == e.editor) {
          editorManager.focusedEditor = null;
        }

        if (!editorManager.activeEditor) {
          DOM.unbind(document, 'selectionchange', selectionChangeHandler);
          DOM.unbind(document, 'focusin', documentFocusInHandler);
          DOM.unbind(document, 'mouseup', documentMouseUpHandler);
          selectionChangeHandler = documentFocusInHandler = documentMouseUpHandler = null;
        }
      };

      editorManager.on('AddEditor', registerEvents);
      editorManager.on('RemoveEditor', unregisterDocumentEvents);
    };

    /**
     * Returns true if the specified element is part of the UI for example an button or text input.
     *
     * @method isEditorUIElement
     * @param  {Element} elm Element to check if it's part of the UI or not.
     * @return {Boolean} True/false state if the element is part of the UI or not.
     */
    FocusManager.isEditorUIElement = function (elm) {
      // Needs to be converted to string since svg can have focus: #6776
      return elm.className.toString().indexOf('mce-') !== -1;
    };

    FocusManager._isUIElement = isUIElement;

    return FocusManager;
  }
);
