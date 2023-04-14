import Editor from 'tinymce/core/api/Editor';

export const isSummary = (node?: Node): node is HTMLElement =>
  node ? node.nodeName === 'SUMMARY' : false;

export const isDetails = (node?: Node): node is HTMLDetailsElement =>
  node ? node.nodeName === 'DETAILS' : false;

export const isAccordionBody = (node?: Node): node is HTMLDivElement =>
  node
    ? node.nodeName === 'DIV' && (node as HTMLDivElement).classList.contains('mce-accordion-body')
    : false;

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

export const isAccordionOpen = (accordion: HTMLDetailsElement): boolean =>
  accordion.hasAttribute('open');
