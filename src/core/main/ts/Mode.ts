/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
/**
 * TinyMCE 5 Mode API.
 *
 * @class tinymce.editor.mode
 */

import { Element, Class } from '@ephox/sugar';
import Editor from './api/Editor';
import Events from './api/Events';
import { Obj, Fun, Arr } from '@ephox/katamari';
import { console } from '@ephox/dom-globals';

export interface Mode {
  /**
   * @method isReadOnly
   * @return {Boolean} true if the editor is in a readonly state.
   */
  isReadOnly: () => boolean;

  /**
   * Sets the editor mode. Mode can be for example "design", "code" or "readonly".
   *
   * @method set
   * @param {String} mode Mode to set the editor in.
   */
  set: (mode: string) => void;

  /**
   * @method get
   * @return {String} The active editor mode.
   */
  get: () => string;

  /**
   * Registers a new editor mode.
   *
   * @method register
   * @param {ModeApi} api Activation and Deactivation API for the new mode.
   */
  register: (mode: string, api: ModeApi) => void;
}

export interface ModeApi {
  /**
   * Handler to activate this mode, called before deactivating the previous mode.
   *
   * @method activate
   */
  activate: () => void;

  /**
   * Handler to deactivate this mode, called after activating the new mode.
   *
   * @method deactivate
   */
  deactivate: () => void;

  /**
   * Flags whether the editor should be made readonly while this mode is active.
   *
   * @property editorReadOnly
   * @type boolean
   */
  editorReadOnly: boolean;
}

// Not quite sugar Class.toggle, it's more of a Class.set
const toggleClass = (elm, cls, state: boolean) => {
  if (Class.has(elm, cls) && state === false) {
    Class.remove(elm, cls);
  } else if (state) {
    Class.add(elm, cls);
  }
};

export const create = (editor: Editor): Mode => {
  let activeMode = 'design';
  const defaultModes = ['design', 'readonly'];

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

    // if activate fails, hope nothing bad happened and abort
    try {
      newMode.activate();
    } catch (e) {
      console.error(`problem while activating editor mode ${mode}:`, e);
      return;
    }
    oldMode.deactivate();
    if (oldMode.editorReadOnly !== newMode.editorReadOnly) {
      toggleReadOnly(newMode.editorReadOnly);
    }
    activeMode = mode;
    Events.fireSwitchMode(editor, mode);
  };

  const set = (mode: string) => {
    if (mode === activeMode) {
      return;
    } else if (!Obj.has(availableModes, mode)) {
      throw new Error(`Editor mode '${mode}' is invalid`);
    }

    if (editor.initialized) {
      switchToMode(mode);
    } else {
      editor.on('init', () => switchToMode(mode));
    }
  };

  const get = () => activeMode;

  const isReadOnly = () => editor.readonly === true;

  const register = (mode: string, api: ModeApi) => {
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

  return {
    isReadOnly,
    set,
    get,
    register
  };
};