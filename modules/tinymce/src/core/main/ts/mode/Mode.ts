import { Arr, Cell, Obj } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Events from '../api/Events';
import { EditorModeApi } from '../api/Mode';
import { toggleReadOnly } from './Readonly';

const defaultModes = [ 'design', 'readonly' ];

const switchToMode = (editor: Editor, activeMode: Cell<[string, EditorModeApi]>, availableModes: Record<string, EditorModeApi>, mode: string) => {
  const [ , oldMode ] = activeMode.get();
  const newMode = availableModes[mode];

  // if deactivate fails, hope nothing bad happened and abort
  try {
    oldMode.deactivate();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`problem while deactivating editor mode ${mode}:`, e);
    return;
  }

  // if activate fails, hope nothing bad happened and abort
  try {
    newMode.activate();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`problem while activating editor mode ${mode}:`, e);
    return;
  }

  if (oldMode.editorReadOnly !== newMode.editorReadOnly) {
    toggleReadOnly(editor, newMode.editorReadOnly);
  }
  activeMode.set([ mode, newMode ]);
  Events.fireSwitchMode(editor, mode);
};

const setMode = (editor: Editor, availableModes: Record<string, EditorModeApi>, activeMode: Cell<[string, EditorModeApi]>, newMode: string): void => {
  const [ mode ] = activeMode.get();
  if (newMode === mode) {
    return;
  } else if (!Obj.has(availableModes, newMode)) {
    throw new Error(`Editor mode '${newMode}' is invalid`);
  }

  if (editor.initialized) {
    switchToMode(editor, activeMode, availableModes, newMode);
  } else {
    editor.on('init', () => switchToMode(editor, activeMode, availableModes, newMode));
  }
};

const registerMode = (availableModes: Record<string, EditorModeApi>, mode: string, api: EditorModeApi): Record<string, EditorModeApi> => {
  if (Arr.contains(defaultModes, mode)) {
    throw new Error(`Cannot override default mode ${mode}`);
  }

  return {
    ...availableModes,
    [mode]: api
  };
};

export {
  setMode,
  registerMode
};
