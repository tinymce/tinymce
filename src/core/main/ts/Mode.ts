/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, Class } from '@ephox/sugar';
import Editor from './api/Editor';
import Events from './api/Events';

type EditorMode = 'readonly' | 'design';

const setEditorCommandState = (editor: Editor, cmd: string, state: boolean) => {
  try {
    editor.getDoc().execCommand(cmd, false, state);
  } catch (ex) {
    // Ignore
  }
};

const toggleClass = (elm, cls, state: boolean) => {
  if (Class.has(elm, cls) && state === false) {
    Class.remove(elm, cls);
  } else if (state) {
    Class.add(elm, cls);
  }
};

const toggleReadOnly = (editor: Editor, state: boolean) => {
  toggleClass(Element.fromDom(editor.getBody()), 'mce-content-readonly', state);

  if (state) {
    editor.selection.controlSelection.hideResizeRect();
    editor.readonly = true;
    editor.getBody().contentEditable = 'false';
  } else {
    editor.readonly = false;
    editor.getBody().contentEditable = 'true';
    setEditorCommandState(editor, 'StyleWithCSS', false);
    setEditorCommandState(editor, 'enableInlineTableEditing', false);
    setEditorCommandState(editor, 'enableObjectResizing', false);
    editor.focus();
    editor.nodeChanged();
  }
};

const setMode = (editor: Editor, mode: EditorMode) => {
  if (mode === getMode(editor)) {
    return;
  }

  if (editor.initialized) {
    toggleReadOnly(editor, mode === 'readonly');
  } else {
    editor.on('init', function () {
      toggleReadOnly(editor, mode === 'readonly');
    });
  }

  Events.fireSwitchMode(editor, mode);
};

const getMode = (editor: Editor) => editor.readonly ? 'readonly' : 'design';

const isReadOnly = (editor: Editor) => editor.readonly === true;

export {
  setMode,
  getMode,
  isReadOnly
};
