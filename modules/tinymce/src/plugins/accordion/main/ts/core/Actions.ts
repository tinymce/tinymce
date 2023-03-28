import Editor from 'tinymce/core/api/Editor';

import { fireInsertAccordionEvent } from '../api/Events';

const nonRemovableContainers = [ 'BODY', 'TD', 'TH' ];
const isNonRemovableContainer = (node: Node): boolean =>
  nonRemovableContainers.includes(node.nodeName);

const validAncestorContainers =
  nonRemovableContainers.concat([ 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'TABLE', 'FIGURE', 'DETAILS', 'DL' ]);
const isValidAncestorContainer = (node: Node): node is HTMLElement => 
  validAncestorContainers.includes(node.nodeName);

const removeBr = (node: Node): void => {
  if (node.firstChild?.nodeName === 'BR') {
    node.firstChild.remove();
  }
};

const insertAccordion = (editor: Editor): void => {
  const dom = editor.dom;

  const rng = editor.selection.getRng();
  const summaryText = rng.toString() || editor.translate('Accordion summary...');
  const bodyText = editor.translate('Accordion body...');

  const target = dom.getParent(rng.commonAncestorContainer, isValidAncestorContainer);

  if (!target) {
    return;
  }

  const details = dom.create('details', { class: 'mce-accordion', open: 'open' });
  const summary = dom.create('summary', { class: 'mce-accordion-summary' }, summaryText);
  const body = dom.create('div', { class: 'mce-accordion-body' }, `<p>${bodyText}</p>`);

  details.appendChild(summary);
  details.appendChild(body);
  removeBr(target);

  const isNonRemovable = isNonRemovableContainer(target);
  target.insertAdjacentElement(isNonRemovable ? 'beforeend' : 'afterend', details);
  if (!isNonRemovable && editor.dom.isEmpty(target)) {
    target.remove();
  }

  editor.selection.setCursorLocation(summary, 1);

  fireInsertAccordionEvent(editor, details);
};

export { insertAccordion };
