/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, Class } from '@ephox/sugar';
import Editor from './api/Editor';
import Events from './api/Events';

export type EditorMode = 'readonly' | 'design';

export const create = (editor: Editor) => {

  const setEditorCommandState = (cmd: string, state: boolean) => {
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

  const toggleReadOnly = (state: boolean) => {
    toggleClass(Element.fromDom(editor.getBody()), 'mce-content-readonly', state);

    if (state) {
      editor.selection.controlSelection.hideResizeRect();
      editor.readonly = true;
      editor.getBody().contentEditable = 'false';
    } else {
      editor.readonly = false;
      editor.getBody().contentEditable = 'true';
      setEditorCommandState('StyleWithCSS', false);
      setEditorCommandState('enableInlineTableEditing', false);
      setEditorCommandState('enableObjectResizing', false);
      editor.focus();
      editor.nodeChanged();
    }
  };

  const setMode = (mode: EditorMode) => {
    if (mode === getMode()) {
      return;
    }

    if (editor.initialized) {
      toggleReadOnly(mode === 'readonly');
    } else {
      editor.on('init', function () {
        toggleReadOnly(mode === 'readonly');
      });
    }

    Events.fireSwitchMode(editor, mode);
  };

  const getMode = () => editor.readonly ? 'readonly' : 'design';

  const isReadOnly = () => editor.readonly === true;

  const register = (mode: EditorMode, options: Record<string, any>) => {

  };


  return {
    setMode,
    getMode,
    isReadOnly,
    set: setMode,
    get: getMode,
    register
  };
};