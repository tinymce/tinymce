/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, Class } from '@ephox/sugar';
import Editor from './api/Editor';
import Events from './api/Events';
import { Obj, Fun } from '@ephox/katamari';
import { console } from '@ephox/dom-globals';

export interface ModeApi {
  activate: () => void
  deactivate: () => void
  editorReadOnly: boolean
}

// Not quite sugar Class.toggle, it's more of a Class.set
const toggleClass = (elm, cls, state: boolean) => {
  if (Class.has(elm, cls) && state === false) {
    Class.remove(elm, cls);
  } else if (state) {
    Class.add(elm, cls);
  }
};

export const create = (editor: Editor) => {
  let activeMode = 'design';
  const defaultModes = ['design', 'readonly'];

  // TODO: remember what I was going to TODO here
  const availableModes: Record<string, ModeApi> = {
    design: {
      activate: Fun.noop,
      deactivate: Fun.noop,
      editorReadOnly: false
    },
    readonly: {
      activate: Fun.noop,
      deactivate: Fun.noop,
      editorReadOnly: true
    }
  };

  const setEditorCommandState = (cmd: string, state: boolean) => {
    try {
      editor.getDoc().execCommand(cmd, false, state);
    } catch (ex) {
      // Ignore
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

  const switchToMode = (mode: string) => {
    const oldMode = availableModes[activeMode];
    const newMode = availableModes[mode];

    oldMode.deactivate();
    newMode.activate();
    if (oldMode.editorReadOnly !== newMode.editorReadOnly) toggleReadOnly(newMode.editorReadOnly);
    activeMode = mode;
  }

  const setMode = (mode: string) => {
    if (mode === activeMode || !Obj.has(availableModes, mode)) {
      return;
    }

    if (editor.initialized) {
      switchToMode(mode);
    } else {
      editor.on('init', () => switchToMode(mode));
    }

    Events.fireSwitchMode(editor, mode);
  };

  const getMode = () => activeMode;

  const isReadOnly = () => editor.readonly === true;

  const register = (mode: string, options: ModeApi) => {
    if (defaultModes.indexOf(mode) > -1) throw new Error('Cannot override default mode ' + mode);
    activeMode[mode] = {
      ...options,
      // wrap custom APIs so they can't break the editor
      activate: () => {
        try {
          options.activate();
        } catch (e) {
          console.error('problem while activating custom editor mode', e);
        }
      },
      deactivate: () => {
        try {
          options.deactivate();
        } catch (e) {
          console.error('problem while deactivating custom editor mode', e);
        }
      },
    };
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