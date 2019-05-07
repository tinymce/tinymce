/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, Class } from '@ephox/sugar';
import Editor from '../api/Editor';
import Events from '../api/Events';
import { Obj, Arr, Cell } from '@ephox/katamari';
import { console } from '@ephox/dom-globals';
import { ModeApi } from '../api/Mode';

const defaultModes = ['design', 'readonly'];

// Not quite sugar Class.toggle, it's more of a Class.set
const toggleClass = (elm: Element, cls: string, state: boolean) => {
  if (Class.has(elm, cls) && state === false) {
    Class.remove(elm, cls);
  } else if (state) {
    Class.add(elm, cls);
  }
};

const setEditorCommandState = (editor: Editor, cmd: string, state: boolean) => {
  try {
    editor.getDoc().execCommand(cmd, false, state);
  } catch (ex) {
    // Ignore
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

const switchToMode = (editor: Editor, activeMode: Cell<string>, availableModes: Record<string, ModeApi>, mode: string) => {
  const oldMode = availableModes[activeMode.get()];
  const newMode = availableModes[mode];

  // if activate fails, hope nothing bad happened and abort
  try {
    newMode.activate();
  } catch (e) {
    console.error(`problem while activating editor mode ${mode}:`, e);
    return;
  }
  oldMode.deactivate();
  if (oldMode.editorReadOnly !== newMode.editorReadOnly) {
    toggleReadOnly(editor, newMode.editorReadOnly);
  }
  activeMode.set(mode);
  Events.fireSwitchMode(editor, mode);
};

const setMode = (editor: Editor, availableModes: Record<string, ModeApi>, activeMode: Cell<string>, mode: string) => {
  if (mode === activeMode.get()) {
    return;
  } else if (!Obj.has(availableModes, mode)) {
    throw new Error(`Editor mode '${mode}' is invalid`);
  }

  if (editor.initialized) {
    switchToMode(editor, activeMode, availableModes, mode);
  } else {
    editor.on('init', () => switchToMode(editor, activeMode, availableModes, mode));
  }
};

const isReadOnly = (editor: Editor) => editor.readonly === true;

const registerMode = (availableModes: Record<string, ModeApi>, mode: string, api: ModeApi) => {
  if (Arr.contains(defaultModes, mode)) {
    throw new Error(`Cannot override default mode ${mode}`);
  }
  availableModes[mode] = {
    ...api,
    deactivate: () => {
      // wrap custom deactivate APIs so they can't break the editor
      try {
        api.deactivate();
      } catch (e) {
        console.error(`problem while deactivating editor mode ${mode}:`);
        console.error(e);
      }
    },
  };
};

export {
  isReadOnly,
  setMode,
  registerMode
};
