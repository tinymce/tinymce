import { Id, Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Events from '../api/Events';
import * as Utils from './Utils';

const insertAccordion = (editor: Editor): void => {
  if (Utils.isInSummary(editor)) {
    return;
  }

  const uid = Id.generate('acc');
  const summaryText = editor.dom.encode(editor.selection.getRng().toString() || editor.translate('Accordion summary...'));
  const bodyText = editor.dom.encode(editor.translate('Accordion body...'));
  editor.insertContent(`<details data-mce-id="${uid}" class="mce-accordion" open="open"><summary class="mce-accordion-summary">${summaryText}</summary><p>${bodyText}</p></details>`);

  const details = editor.dom.select(`[data-mce-id="${uid}"]`)[0];
  if (!details) {
    return;
  }
  details.removeAttribute('data-mce-id');

  const summary = editor.dom.select('summary', details)[0];
  if (summary) {
    editor.selection.setCursorLocation(summary, 1);
  }
};

const toggleDetailsElement = (details: HTMLDetailsElement, state?: boolean): boolean => {
  const shouldOpen = state ?? !Utils.isOpen(details);
  if (shouldOpen) {
    details.setAttribute('open', 'open');
    details.setAttribute('data-mce-open', 'open');
  } else {
    details.removeAttribute('open');
    details.removeAttribute('data-mce-open');
  }
  return shouldOpen;
};

const toggleAccordion = (editor: Editor, state?: boolean): void => {
  const details = Utils.getSelectedDetails(editor);
  if (details) {
    Events.fireToggleAccordionEvent(editor, details, toggleDetailsElement(details, state));
  }
};

const removeAccordion = (editor: Editor): void => {
  const details = Utils.getSelectedDetails(editor);
  if (!details) {
    return;
  }

  const { nextSibling } = details;
  if (nextSibling) {
    editor.selection.select(nextSibling, true);
    editor.selection.collapse(true);
  } else {
    Utils.insertAndSelectParagraphAfter(editor, details);
  }

  details.remove();
};

const toggleAllAccordions = (editor: Editor, state?: boolean): void => {
  const accordions = Array.from(editor.getBody().querySelectorAll('details'));
  if (accordions.length === 0) {
    return;
  }
  const shouldOpen = state ?? !Utils.isOpen(accordions[0]);
  Arr.each(accordions, (accordion) => toggleDetailsElement(accordion, shouldOpen));
  Events.fireToggleAllAccordionsEvent(editor, accordions, shouldOpen);
};

export {
  insertAccordion,
  toggleAccordion,
  removeAccordion,
  toggleAllAccordions
};
