/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import { Focus, SugarElement, SugarShadowDom } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import EditorManager from '../api/EditorManager';
import FocusManager from '../api/FocusManager';
import * as Settings from '../api/Settings';
import Delay from '../api/util/Delay';
import * as SelectionRestore from '../selection/SelectionRestore';

let documentFocusInHandler;
const DOM = DOMUtils.DOM;

const isEditorUIElement = (elm: Element) => {
  // Since this can be overridden by third party we need to use the API reference here
  return FocusManager.isEditorUIElement(elm);
};

const isEditorContentAreaElement = (elm: Element) => {
  const classList = elm.classList;
  if (classList !== undefined) {
    // tox-edit-area__iframe === iframe container element
    // mce-content-body === inline body element
    return classList.contains('tox-edit-area') || classList.contains('tox-edit-area__iframe') || classList.contains('mce-content-body');
  } else {
    return false;
  }
};

const isUIElement = (editor: Editor, elm: Node) => {
  const customSelector = Settings.getCustomUiSelector(editor);
  const parent = DOM.getParent(elm, (elm) => {
    return (
      isEditorUIElement(elm) ||
      (customSelector ? editor.dom.is(elm, customSelector) : false)
    );
  });
  return parent !== null;
};

const getActiveElement = (editor: Editor): Element => {
  try {
    const root = SugarShadowDom.getRootNode(SugarElement.fromDom(editor.getElement()));
    return Focus.active(root).fold(
      () => document.body,
      (x) => x.dom
    );
  } catch (ex) {
    // IE sometimes fails to get the activeElement when resizing table
    // TODO: Investigate this
    return document.body;
  }
};

const registerEvents = (editorManager: EditorManager, e: { editor: Editor }) => {
  const editor = e.editor;

  SelectionRestore.register(editor);

  editor.on('focusin', () => {
    const focusedEditor = editorManager.focusedEditor;

    if (focusedEditor !== editor) {
      if (focusedEditor) {
        focusedEditor.fire('blur', { focusedEditor: editor });
      }

      editorManager.setActive(editor);
      editorManager.focusedEditor = editor;
      editor.fire('focus', { blurredEditor: focusedEditor });
      editor.focus(true);
    }
  });

  editor.on('focusout', () => {
    Delay.setEditorTimeout(editor, () => {
      const focusedEditor = editorManager.focusedEditor;

      // Still the same editor the blur was outside any editor UI
      if (!isUIElement(editor, getActiveElement(editor)) && focusedEditor === editor) {
        editor.fire('blur', { focusedEditor: null });
        editorManager.focusedEditor = null;
      }
    });
  });

  // Check if focus is moved to an element outside the active editor by checking if the target node
  // isn't within the body of the activeEditor nor a UI element such as a dialog child control
  if (!documentFocusInHandler) {
    documentFocusInHandler = (e: FocusEvent) => {
      const activeEditor = editorManager.activeEditor;

      if (activeEditor) {
        SugarShadowDom.getOriginalEventTarget(e).each((target: Element) => {
          if (target.ownerDocument === document) {
            // Fire a blur event if the element isn't a UI element
            if (target !== document.body && !isUIElement(activeEditor, target) && editorManager.focusedEditor === activeEditor) {
              activeEditor.fire('blur', { focusedEditor: null });
              editorManager.focusedEditor = null;
            }
          }
        });
      }
    };

    DOM.bind(document, 'focusin', documentFocusInHandler);
  }
};

const unregisterDocumentEvents = (editorManager: EditorManager, e: { editor: Editor }) => {
  if (editorManager.focusedEditor === e.editor) {
    editorManager.focusedEditor = null;
  }

  if (!editorManager.activeEditor) {
    DOM.unbind(document, 'focusin', documentFocusInHandler);
    documentFocusInHandler = null;
  }
};

const setup = (editorManager: EditorManager) => {
  editorManager.on('AddEditor', Fun.curry(registerEvents, editorManager));
  editorManager.on('RemoveEditor', Fun.curry(unregisterDocumentEvents, editorManager));
};

export {
  setup,
  isEditorUIElement,
  isEditorContentAreaElement,
  isUIElement
};
