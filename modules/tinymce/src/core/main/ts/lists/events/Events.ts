import Editor from '../../api/Editor';
import { EditorEvent } from '../../api/util/EventDispatcher';
import { ListAction } from '../lists/ListAction';

export const fireListEvent = (editor: Editor, action: ListAction, element: Node | null): EditorEvent<{ action: ListAction; element: Node | null }> =>
  editor.dispatch('ListMutation', { action, element });
