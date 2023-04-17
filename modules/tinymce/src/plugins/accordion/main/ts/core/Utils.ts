import Editor from 'tinymce/core/api/Editor';

export const isSummary = (node?: Node): node is HTMLElement =>
  node?.nodeName === 'SUMMARY';

export const isDetails = (node?: Node): node is HTMLDetailsElement =>
  node?.nodeName === 'DETAILS';

export const isAccordionBody = (node?: Node): node is HTMLDivElement =>
  node?.nodeName === 'DIV' && (node as HTMLDivElement).classList.contains('mce-accordion-body')

export const isAccordionOpen = (accordion: HTMLDetailsElement): boolean =>
  accordion.hasAttribute('open');

export const isInSummary = (editor: Editor): boolean => {
  const node = editor.selection.getNode();
  return isSummary(node) || Boolean(editor.dom.getParent(node, isSummary));
};

export const getSelectedDetails = (editor: Editor): HTMLDetailsElement | null => {
  const node = editor.selection.getNode();
  if (!node) {
    return null;
  }
  return editor.dom.getParent(node, isDetails);
};

export const insertAndSelectParagraphAfter = (editor: Editor, target: HTMLElement): void => {
  const paragraph = editor.dom.create('p');
  paragraph.innerHTML = '<br data-mce-bogus="1" />';
  target.insertAdjacentElement('afterend', paragraph);
  editor.selection.setCursorLocation(paragraph, 0);
};
