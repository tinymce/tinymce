/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document, Element, FocusEvent } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import FocusManager from '../api/FocusManager';
import DOMUtils from '../api/dom/DOMUtils';
import SelectionRestore from '../selection/SelectionRestore';
import Delay from '../api/util/Delay';
import EditorManager from '../api/EditorManager';
import Editor from '../api/Editor';

let documentFocusInHandler;
const DOM = DOMUtils.DOM;

const isEditorUIElement = function (elm: Element) {
  // Since this can be overridden by third party we need to use the API reference here
  return FocusManager.isEditorUIElement(elm);
};

const isUIElement = function (editor: Editor, elm: Element) {
  const customSelector = editor ? editor.settings.custom_ui_selector : '';
  const parent = DOM.getParent(elm, function (elm) {
    return (
      isEditorUIElement(elm) ||
      (customSelector ? editor.dom.is(elm, customSelector) : false)
    );
  });
  return parent !== null;
};

const getActiveElement = function (): Element {
  try {
    return document.activeElement;
  } catch (ex) {
    // IE sometimes fails to get the activeElement when resizing table
    // TODO: Investigate this
    return document.body;
  }
};

const registerEvents = function (editorManager: EditorManager, e: { editor: Editor }) {
  const editor = e.editor;

  SelectionRestore.register(editor);

  editor.on('focusin', function () {
    const self: Editor = this;
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
    const self: Editor = this;
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
    documentFocusInHandler = function (e: FocusEvent) {
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

const unregisterDocumentEvents = function (editorManager: EditorManager, e: { editor: Editor }) {
  if (editorManager.focusedEditor === e.editor) {
    editorManager.focusedEditor = null;
  }

  if (!editorManager.activeEditor) {
    DOM.unbind(document, 'focusin', documentFocusInHandler);
    documentFocusInHandler = null;
  }
};

const setup = function (editorManager: EditorManager) {
  editorManager.on('AddEditor', Fun.curry(registerEvents, editorManager));
  editorManager.on('RemoveEditor', Fun.curry(unregisterDocumentEvents, editorManager));
};

export default {
  setup,
  isEditorUIElement,
  isUIElement
};