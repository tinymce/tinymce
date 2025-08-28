import Editor from '../Editor';

export const registerCommands = (editor: Editor): void => {
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
