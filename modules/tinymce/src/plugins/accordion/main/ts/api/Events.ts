import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

export const fireInsertAccordionEvent = (editor: Editor, element: HTMLDetailsElement): EditorEvent<{ element: HTMLDetailsElement }> =>
  editor.dispatch('InsertAccordion', { element });
