import type Editor from '../../api/Editor';
import type { EditorEvent } from '../../api/util/EventDispatcher';
import type { ListAction } from '../lists/ListAction';

export const fireListEvent = (editor: Editor, action: ListAction, element: Node | null): EditorEvent<{ action: ListAction; element: Node | null }> =>
  editor.dispatch('ListMutation', { action, element });
