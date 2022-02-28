import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import { ListAction } from '../core/ListAction';

export const fireListEvent = (editor: Editor, action: ListAction, element: Node): EditorEvent<{ action: ListAction; element: Node }> =>
  editor.dispatch('ListMutation', { action, element });
