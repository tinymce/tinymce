/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import * as Events from '../api/Events';
import { Obj, Arr, Cell } from '@ephox/katamari';
import { console } from '@ephox/dom-globals';
import { ModeApi } from '../api/Mode';
import { toggleReadOnly } from './Readonly';

const defaultModes = [ 'design', 'readonly' ];

const switchToMode = (editor: Editor, activeMode: Cell<string>, availableModes: Record<string, ModeApi>, mode: string) => {
  const oldMode = availableModes[activeMode.get()];
  const newMode = availableModes[mode];

  // if activate fails, hope nothing bad happened and abort
  try {
    newMode.activate();
  } catch (e) {
    // tslint:disable-next-line:no-console
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

const registerMode = (availableModes: Record<string, ModeApi>, mode: string, api: ModeApi): Record<string, ModeApi> => {
  if (Arr.contains(defaultModes, mode)) {
    throw new Error(`Cannot override default mode ${mode}`);
  }

  return {
    ...availableModes,
    [mode]: {
      ...api,
      deactivate: () => {
        // wrap custom deactivate APIs so they can't break the editor
        try {
          api.deactivate();
        } catch (e) {
          // tslint:disable-next-line:no-console
          console.error(`problem while deactivating editor mode ${mode}:`, e);
        }
      }
    }
  };
};

export {
  setMode,
  registerMode
};
