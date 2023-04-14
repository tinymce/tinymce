import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

export const fireToggleAccordionEvent =
  (editor: Editor, element: HTMLDetailsElement, state: boolean): EditorEvent<{ element: HTMLDetailsElement; state: boolean }> =>
    editor.dispatch('ToggledAccordion', { element, state });

export const fireToggleAllAccordionsEvent =
  (editor: Editor, elements: HTMLDetailsElement[], state: boolean): EditorEvent<{ elements: HTMLDetailsElement[]; state: boolean }> =>
    editor.dispatch('ToggledAllAccordions', { elements, state });
