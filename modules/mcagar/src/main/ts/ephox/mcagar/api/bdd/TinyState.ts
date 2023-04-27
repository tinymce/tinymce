import { Editor as EditorType } from '../../alien/EditorTypes';

export const withNoneditableRootEditor = <T extends EditorType = EditorType>(editor: T, f: (editor: T) => void): void => {
  editor.getBody().contentEditable = 'false';
  f(editor);
  editor.getBody().contentEditable = 'true';
};

export const withNoneditableRootEditorAsync = async <T extends EditorType = EditorType>(editor: T, f: (editor: T) => Promise<void>): Promise<void> => {
  editor.getBody().contentEditable = 'false';
  await f(editor);
  editor.getBody().contentEditable = 'true';
};

