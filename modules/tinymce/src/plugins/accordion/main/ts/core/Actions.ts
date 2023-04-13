import { Id } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Events from '../api/Events';

const insertAccordion = (editor: Editor): void => {
  const container = editor.selection.getNode();
  if (container.nodeName === 'SUMMARY') {
    const body = editor.dom.getNext(container, 'div.mce-accordion-body');
    if (!body?.lastChild) {
      return;
    }
    editor.selection.setCursorLocation(body.lastChild, 1);
  }

  const uid = Id.generate('acc');
  const summaryText = editor.dom.encode(editor.selection.getRng().toString() || editor.translate('Accordion summary...'));
  const bodyText = editor.dom.encode(editor.translate('Accordion body...'));
  editor.insertContent(`<details data-mce-id="${uid}" class="mce-accordion" open="open"><summary class="mce-accordion-summary">${summaryText}</summary><div class="mce-accordion-body"><p>${bodyText}</p></div></details>`);

  const details = editor.dom.select(`[data-mce-id="${uid}"]`)[0];
  if (!details) {
    return;
  }
  details.removeAttribute('data-mce-id');

  const summary = editor.dom.select('summary', details)[0];
  if (summary) {
    editor.selection.setCursorLocation(summary, 1);
  }

  Events.fireInsertAccordionEvent(editor, details);
};

export { insertAccordion };
