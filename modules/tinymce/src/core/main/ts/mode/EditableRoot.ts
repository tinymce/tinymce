import Editor from '../api/Editor';
import * as Events from '../api/Events';

export const setEditableRoot = (editor: Editor, state: boolean): void => {
  if (editor._editableRoot !== state) {
    editor._editableRoot = state;

    if (!editor.readonly) {
      editor.getBody().contentEditable = String(editor.hasEditableRoot());
      editor.nodeChanged();
    }

    Events.fireEditableRootStateChange(editor, state);
  }
};

export const hasEditableRoot = (editor: Editor): boolean => editor._editableRoot;

