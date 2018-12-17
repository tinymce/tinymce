import { Editor } from 'tinymce/core/api/Editor';

export const enum ListActions {
  ToggleUlList = 'ToggleUlList',
  ToggleOlList = 'ToggleOlList',
  ToggleDLList = 'ToggleDLList'
}

export const fireListEvent = (editor: Editor, action: ListActions, element) => editor.fire('ListMutation', { action, element });
