import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

export const isSummary = (node?: Node): node is HTMLElement =>
  node?.nodeName === 'SUMMARY';

export const isDetails = (node?: Node | null): node is HTMLDetailsElement =>
  node?.nodeName === 'DETAILS';

export const isAccordionBody = (node?: Node | null): node is HTMLDivElement =>
  node?.nodeName === 'DIV' && (node as HTMLDivElement).classList.contains('mce-accordion-body');

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
  let body = accordion?.lastChild;
  if (!isAccordionBody(body)) {
    body = editor.dom.create('div', { class: 'mce-accordion-body' });
    accordion.appendChild(body);
  }

  if (body && !body.lastChild) {
    const paragraph = createParagraph(editor);
    body.appendChild(paragraph);
    editor.selection.setCursorLocation(paragraph, 0);
  }
};

export const normalizeAccordions = (editor: Editor): void => {
  Tools.each(
    Tools.grep(editor.dom.select<HTMLDetailsElement>('details.mce-accordion', editor.getBody())),
    normalizeAccordion(editor)
  );
};
