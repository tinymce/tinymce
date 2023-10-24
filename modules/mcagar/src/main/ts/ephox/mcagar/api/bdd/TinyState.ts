import { Editor as EditorType } from '../../alien/EditorTypes';

const setEditableRoot = <T extends EditorType = EditorType>(editor: T, state: boolean) => {
  if (editor.setEditableRoot) {
    editor.setEditableRoot(state);
  } else {
    throw new Error('setEditableRoot requires at least TinyMCE v6.5');
  }
};

export const withNoneditableRootEditor = <T extends EditorType = EditorType>(editor: T, f: (editor: T) => void): void => {
  setEditableRoot(editor, false);
  f(editor);
  setEditableRoot(editor, true);
};

export const withNoneditableRootEditorAsync = async <T extends EditorType = EditorType>(editor: T, f: (editor: T) => Promise<void>): Promise<void> => {
  setEditableRoot(editor, false);
  await f(editor);
  setEditableRoot(editor, true);
};

