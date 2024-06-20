import { Cell, Fun, Obj, Type } from '@ephox/katamari';

import { registerMode, setMode } from '../mode/Mode';
import { isReadOnly, registerReadOnlyContentFilters, registerReadOnlySelectionBlockers } from '../mode/Readonly';
import Editor from './Editor';

type EditorReadOnlyType = boolean | { uiEnabled: boolean; selectionEnabled: boolean };

/**
 * TinyMCE Editor Mode API.
 *
 * @class tinymce.EditorMode
 */


export interface EditorMode {
  allowSelectionInReadOnly: () => boolean;
  allowUiInReadOnly: () => boolean;

  /**
   * Checks if the editor is in a readonly state.
   *
   * @method isReadOnly
   * @return {Boolean} true if the editor is in a readonly state.
   */
  isReadOnly: () => boolean;

  /**
   * Sets the editor mode. The available modes are "design" and "readonly". Additional modes can be registered using 'register'.
   *
   * @method set
   * @param {String} mode Mode to set the editor in.
   */
  set: (mode: string) => void;

  /**
   * Returns the active editor mode, such as "design" or "readonly".
   *
   * @method get
   * @return {String} The active editor mode.
   */
  get: () => string;

  /**
   * Registers a new editor mode.
   *
   * @method register
   * @param {EditorModeApi} api Activation and Deactivation API for the new mode.
   */
  register: (mode: string, api: EditorModeApi) => void;
}

export interface EditorModeApi {
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
   * @type Object
   */
  editorReadOnly: EditorReadOnlyType;

}

export const create = (editor: Editor): EditorMode => {
  const activeMode = Cell('design');
  const availableModes = Cell<Record<string, EditorModeApi>>({
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
  });

  registerReadOnlyContentFilters(editor);
  registerReadOnlySelectionBlockers(editor);

  return {
    allowUiInReadOnly: () => {
      const mode = availableModes.get()[activeMode.get()].editorReadOnly;
      return Type.isBoolean(mode) ? false : Obj.get(mode, 'uiEnabled').getOr(false);
    },
    allowSelectionInReadOnly: () => {
      const mode = availableModes.get()[activeMode.get()].editorReadOnly;
      return Type.isBoolean(mode) ? false : Obj.get(mode, 'selectionEnabled').getOr(false);
    },
    isReadOnly: () => isReadOnly(editor),
    set: (mode: string) => setMode(editor, availableModes.get(), activeMode, mode),
    get: () => activeMode.get(),
    register: (mode: string, api: EditorModeApi) => {
      availableModes.set(registerMode(availableModes.get(), mode, api));
    }
  };
};
