import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

const fireInsertCustomChar = (editor: Editor, chr: string): EditorEvent<{ chr: string }> => {
  return editor.dispatch('insertCustomChar', { chr });
};

export {
  fireInsertCustomChar
};
