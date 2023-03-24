import Editor from 'tinymce/core/api/Editor';

import { fireInsertAccordionEvent } from '../api/Events';

const validAncestorContainers = [ 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'TABLE', 'FIGURE', 'DETAILS', 'DIV', 'DL', 'BODY' ];
const isValidAncestorContainer = (node: Node): node is HTMLElement => 
  validAncestorContainers.includes(node.nodeName);

const insertAccordion = (editor: Editor): void => {
  const dom = editor.dom;

  const rng = editor.selection.getRng();
  const summaryText = rng.toString() || 'Accordion summary...';

  const target = dom.getParent(rng.commonAncestorContainer, isValidAncestorContainer);

  if (!target) {
    return;
  }

  const details = dom.create('details', { class: 'mce-accordion', open: 'open' });
  const summary = dom.create('summary', { class: 'mce-accordion-summary' }, summaryText);
  const body = dom.create('div', { class: 'mce-accordion-body' }, '<p>Accordion body...</p>');

  details.appendChild(summary);
  details.appendChild(body);
  target.insertAdjacentElement(target.nodeName === 'BODY' ? 'beforeend' : 'afterend', details);

  if (editor.dom.isEmpty(target)) {
    target.remove();
  }

  editor.selection.setCursorLocation(summary, 1);

  fireInsertAccordionEvent(editor, details);
};

export { insertAccordion };
