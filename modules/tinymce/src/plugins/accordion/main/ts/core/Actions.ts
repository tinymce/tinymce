import { Id, Arr } from '@ephox/katamari';
import { DomDescent } from '@ephox/phoenix';
import { Attribute, SelectorFind, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Events from '../api/Events';
import * as Identifiers from './Identifiers';
import * as Utils from './Utils';

const insertAccordion = (editor: Editor): void => {
  if (!Utils.isInsertAllowed(editor)) {
    return;
  }

  const editorBody = SugarElement.fromDom(editor.getBody());
  const uid = Id.generate('acc');
  const summaryText = editor.dom.encode(editor.selection.getRng().toString() || editor.translate('Accordion summary...'));
  const bodyText = editor.dom.encode(editor.translate('Accordion body...'));

  const accordionSummaryHtml = `<summary class="${Identifiers.accordionSummaryClass}">${summaryText}</summary>`;
  const accordionBodyHtml = `<${Identifiers.accordionBodyWrapperTag} class="${Identifiers.accordionBodyWrapperClass}"><p>${bodyText}</p></${Identifiers.accordionBodyWrapperTag}>`;

  editor.undoManager.transact(() => {
    editor.insertContent([
      `<details data-mce-id="${uid}" class="${Identifiers.accordionDetailsClass}" open="open">`,
      accordionSummaryHtml,
      accordionBodyHtml,
      `</details>`
    ].join(''));

    SelectorFind.descendant(editorBody, `[data-mce-id="${uid}"]`).each((detailsElm) => {
      Attribute.remove(detailsElm, 'data-mce-id');
      SelectorFind.descendant(detailsElm, `summary`).each((summaryElm) => {
        // Set the cursor location to be at the end of the summary text
        const rng = editor.dom.createRng();
        const des = DomDescent.freefallRtl(summaryElm);
        rng.setStart(des.element.dom as Node, des.offset);
        rng.setEnd(des.element.dom as Node, des.offset);
        editor.selection.setRng(rng);
      });
    });
  });
};

const toggleDetailsElement = (details: HTMLDetailsElement, state?: boolean): boolean => {
  const shouldOpen = state ?? !Utils.isOpen(details);
  if (shouldOpen) {
    details.setAttribute('open', 'open');
  } else {
    details.removeAttribute('open');
  }
  return shouldOpen;
};

const toggleAccordion = (editor: Editor, state?: boolean): void => {
  Utils.getSelectedDetails(editor).each((details) => {
    Events.fireToggleAccordionEvent(editor, details, toggleDetailsElement(details, state));
  });
};

const removeAccordion = (editor: Editor): void => {
  Utils.getSelectedDetails(editor).each((details) => {
    const { nextSibling } = details;
    if (nextSibling) {
      editor.selection.select(nextSibling, true);
      editor.selection.collapse(true);
    } else {
      Utils.insertAndSelectParagraphAfter(editor, details);
    }

    details.remove();
  });
};

const toggleAllAccordions = (editor: Editor, state?: boolean): void => {
  const accordions = Array.from(editor.getBody().querySelectorAll('details'));
  if (accordions.length === 0) {
    return;
  }
  Arr.each(accordions, (accordion) => toggleDetailsElement(accordion, state ?? !Utils.isOpen(accordion)));
  Events.fireToggleAllAccordionsEvent(editor, accordions, state);
};

export {
  insertAccordion,
  toggleAccordion,
  removeAccordion,
  toggleAllAccordions
};
