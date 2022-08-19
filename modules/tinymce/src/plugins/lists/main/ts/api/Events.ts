import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import { ListAction } from '../core/ListAction';

export const fireListEvent = (editor: Editor, action: ListAction, element: Node | null): EditorEvent<{ action: ListAction; element: Node | null }> =>
  editor.dispatch('ListMutation', { action, element });
