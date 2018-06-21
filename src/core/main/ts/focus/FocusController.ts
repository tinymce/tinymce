/**
 * FocusController.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import FocusManager from '../api/FocusManager';
import DOMUtils from '../api/dom/DOMUtils';
import SelectionRestore from '../selection/SelectionRestore';
import Delay from '../api/util/Delay';
import { document } from '@ephox/dom-globals';

let documentFocusInHandler;
const DOM = DOMUtils.DOM;

const isEditorUIElement = function (elm) {
  // Since this can be overridden by third party we need to use the API reference here
  return FocusManager.isEditorUIElement(elm);
};

const isUIElement = function (editor, elm) {
  const customSelector = editor ? editor.settings.custom_ui_selector : '';
  const parent = DOM.getParent(elm, function (elm) {
    return (
      isEditorUIElement(elm) ||
      (customSelector ? editor.dom.is(elm, customSelector) : false)
    );
  });
  return parent !== null;
};

const getActiveElement = function () {
  try {
    return document.activeElement;
  } catch (ex) {
    // IE sometimes fails to get the activeElement when resizing table
    // TODO: Investigate this
    return document.body;
  }
};

const registerEvents = function (editorManager, e) {
  const editor = e.editor;

  SelectionRestore.register(editor);

  editor.on('focusin', function () {
    const self = this;
    const focusedEditor = editorManager.focusedEditor;

    if (focusedEditor !== self) {
      if (focusedEditor) {
        focusedEditor.fire('blur', { focusedEditor: self });
      }

      editorManager.setActive(self);
      editorManager.focusedEditor = self;
      self.fire('focus', { blurredEditor: focusedEditor });
      self.focus(true);
    }
  });

  editor.on('focusout', function () {
    const self = this;
    Delay.setEditorTimeout(self, function () {
      const focusedEditor = editorManager.focusedEditor;

      // Still the same editor the blur was outside any editor UI
      if (!isUIElement(self, getActiveElement()) && focusedEditor === self) {
        self.fire('blur', { focusedEditor: null });
        editorManager.focusedEditor = null;
      }
    });
  });

  // Check if focus is moved to an element outside the active editor by checking if the target node
  // isn't within the body of the activeEditor nor a UI element such as a dialog child control
  if (!documentFocusInHandler) {
    documentFocusInHandler = function (e) {
      const activeEditor = editorManager.activeEditor;
      let target;

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

const unregisterDocumentEvents = function (editorManager, e) {
  if (editorManager.focusedEditor === e.editor) {
    editorManager.focusedEditor = null;
  }

  if (!editorManager.activeEditor) {
    DOM.unbind(document, 'focusin', documentFocusInHandler);
    documentFocusInHandler = null;
  }
};

const setup = function (editorManager) {
  editorManager.on('AddEditor', Fun.curry(registerEvents, editorManager));
  editorManager.on('RemoveEditor', Fun.curry(unregisterDocumentEvents, editorManager));
};

export default {
  setup,
  isEditorUIElement,
  isUIElement
};