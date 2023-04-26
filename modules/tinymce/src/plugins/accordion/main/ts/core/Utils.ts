import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

export const isSummary = (node?: Node | null): node is HTMLElement =>
  node?.nodeName === 'SUMMARY';

export const isDetails = (node?: Node | null): node is HTMLDetailsElement =>
  node?.nodeName === 'DETAILS';

export const isOpen = (details: HTMLDetailsElement): boolean =>
  details.hasAttribute('open');

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

export const isDetailsSelected = (editor: Editor): boolean =>
  Boolean(getSelectedDetails(editor));

export const createParagraph = (editor: Editor): HTMLParagraphElement => {
  const paragraph = editor.dom.create('p');
  paragraph.innerHTML = '<br data-mce-bogus="1" />';
  return paragraph;
};

export const insertAndSelectParagraphAfter = (editor: Editor, target: HTMLElement): void => {
  const paragraph = createParagraph(editor);
  target.insertAdjacentElement('afterend', paragraph);
  editor.selection.setCursorLocation(paragraph, 0);
};

export const normalizeAccordion = (editor: Editor) => (accordion: HTMLDetailsElement): void => {
  if (isSummary(accordion?.lastChild)) {
    const paragraph = createParagraph(editor);
    accordion.appendChild(paragraph);
    editor.selection.setCursorLocation(paragraph, 0);
  }
};

export const normalizeDetails = (editor: Editor): void => {
  Tools.each(
    Tools.grep(editor.dom.select<HTMLDetailsElement>('details', editor.getBody())),
    normalizeAccordion(editor)
  );
};
