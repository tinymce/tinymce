/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../Editor';

export const registerCommands = (editor: Editor) => {
  editor.editorCommands.addCommands({
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
