import Editor from 'tinymce/core/api/Editor';

const insertAccordion = (editor: Editor): void => {
  const dom = editor.dom;

  const rng = editor.selection.getRng();
  const summaryText = rng.collapsed ? 'Accordion summary...' : rng.toString();

  const target = dom.getParent(rng.commonAncestorContainer, dom.isBlock);
  if (!target) {
    return;
  }

  const details = dom.create('details', { class: 'mce-accordion', open: 'open' });
  const summary = dom.create('summary', { class: 'mce-accordion-summary' }, summaryText);
  const body = dom.create('div', { class: 'mce-accordion-body' }, '<p>Accordion body...</p>');

  details.appendChild(summary);
  details.appendChild(body);
  target.insertAdjacentElement('afterend', details);

  if (editor.dom.isEmpty(target)) {
    target.remove();
  }

  editor.selection.setCursorLocation(summary, 1);
};

export { insertAccordion };
