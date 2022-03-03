import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

const fireVisualChars = (editor: Editor, state: boolean): EditorEvent<{ state: boolean }> => {
  return editor.dispatch('VisualChars', { state });
};

export {
  fireVisualChars
};
