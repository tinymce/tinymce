import { Arr, Id } from '@ephox/katamari';
import { DomDescent } from '@ephox/phoenix';
import { Attribute, Compare, Insert, SelectorFind, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import type Editor from 'tinymce/core/api/Editor';

import * as Events from '../api/Events';
import * as Options from '../api/Options';

import * as Identifiers from './Identifiers';
import * as Utils from './Utils';

const isIgnoredSibling = (node: SugarElement<Node>): boolean =>
  SugarNode.isText(node) && /^[ \t\r\n]*$/.test(node.dom.data) || SugarNode.isElement(node) && Attribute.has(node, 'data-mce-bogus');

// Add an empty block after an accordion that ends the document so the caret can be placed after it
const addTrailingBlockIfLast = (editor: Editor, details: SugarElement<Element>): void => {
  const body = SugarElement.fromDom(editor.getBody());
  const isDirectChildOfBody = Traverse.parent(details).exists((parent) => Compare.eq(parent, body));
  const isLast = Arr.forall(Traverse.nextSiblings(details), isIgnoredSibling);
  if (isDirectChildOfBody && isLast) {
    const block = editor.dom.create(Options.getForcedRootBlock(editor), Options.getForcedRootBlockAttrs(editor), '<br data-mce-bogus="1">');
    Insert.after(details, SugarElement.fromDom(block));
  }
};

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
      addTrailingBlockIfLast(editor, detailsElm);
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

const toggleDetailsElement = (isReadonly: boolean, details: HTMLDetailsElement, state?: boolean): boolean => {
  const shouldOpen = state ?? !Utils.isOpen(details);

  if (!isReadonly) {
    details.setAttribute(Identifiers.accordionReadonlyCompensationAttribute, shouldOpen ? 'open' : 'closed');
  }

  if (shouldOpen) {
    details.setAttribute('open', 'open');
  } else {
    details.removeAttribute('open');
  }
  return shouldOpen;
};

const toggleAccordion = (editor: Editor, state?: boolean): void => {
  if (Options.isDisabled(editor)) {
    return;
  }

  Utils.getSelectedDetails(editor).each((details) => {
    Events.fireToggleAccordionEvent(editor, details, toggleDetailsElement(editor.readonly, details, state));
  });
};

const removeAccordion = (editor: Editor): void => {
  if (!editor.mode.isReadOnly()) {
    Utils.getSelectedDetails(editor)
      .each((details) => {
        const { nextSibling } = details;
        if (nextSibling) {
          editor.selection.select(nextSibling, true);
          editor.selection.collapse(true);
        } else {
          Utils.insertAndSelectParagraphAfter(editor, details);
        }

        details.remove();
      });
  }
};

const toggleAllAccordions = (editor: Editor, state?: boolean): void => {
  const accordions = Array.from(editor.getBody().querySelectorAll('details'));
  if (accordions.length === 0) {
    return;
  }
  Arr.each(accordions, (accordion) => toggleDetailsElement(editor.readonly, accordion, state ?? !Utils.isOpen(accordion)));
  Events.fireToggleAllAccordionsEvent(editor, accordions, state);
};

export {
  insertAccordion,
  toggleAccordion,
  removeAccordion,
  toggleAllAccordions
};
