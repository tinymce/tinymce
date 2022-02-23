import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

const fireResizeEditor = (editor: Editor): EditorEvent<{}> =>
  editor.dispatch('ResizeEditor');

export {
  fireResizeEditor
};
