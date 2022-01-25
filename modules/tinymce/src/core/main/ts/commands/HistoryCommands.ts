/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';

import type Editor from '../api/Editor';

export const registerCommands = (editor: Editor) => {
  editor.editorCommands.addCommands({
    mceBeginUndoLevel: Fun.noop,

    mceAddUndoLevel: () => {
      editor.undoManager.add();
    },

    mceEndUndoLevel: () => {
      editor.undoManager.add();
    },

    Undo: () => {
      editor.undoManager.undo();
    },

    Redo: () => {
      editor.undoManager.redo();
    }
  });
};
