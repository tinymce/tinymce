import { Editor as EditorType } from '../../alien/EditorTypes';

export const withNoneditableRootEditor = <T extends EditorType = EditorType>(editor: T, f: (editor: T) => void): void => {
  editor.setEditableRoot(false);
  f(editor);
  editor.setEditableRoot(true);
};

export const withNoneditableRootEditorAsync = async <T extends EditorType = EditorType>(editor: T, f: (editor: T) => Promise<void>): Promise<void> => {
  editor.setEditableRoot(false);
  await f(editor);
  editor.setEditableRoot(true);
};

