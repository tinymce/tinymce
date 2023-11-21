import { Optional } from '@ephox/katamari';

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

export const isAtDetailsStart = (editor: Editor): boolean => {
  const rng = editor.selection.getRng();
  return isDetails(rng.startContainer)
    && rng.collapsed
    && rng.startOffset === 0;
};

export const isInsertAllowed = (editor: Editor): boolean =>
  !isInSummary(editor) && editor.dom.isEditable(editor.selection.getNode());

export const getSelectedDetails = (editor: Editor): Optional<HTMLDetailsElement> =>
  Optional.from(editor.dom.getParent(editor.selection.getNode(), isDetails));

export const isDetailsSelected = (editor: Editor): boolean =>
  getSelectedDetails(editor).isSome();

export const insertBogus = <T extends HTMLElement>(element: T): T => {
  element.innerHTML = '<br data-mce-bogus="1" />';
  return element;
};

export const createParagraph = (editor: Editor): HTMLParagraphElement =>
  insertBogus(editor.dom.create('p'));

export const createSummary = (editor: Editor): HTMLElement =>
  insertBogus(editor.dom.create('summary'));

export const insertAndSelectParagraphAfter = (editor: Editor, target: HTMLElement): void => {
  const paragraph = createParagraph(editor);
  target.insertAdjacentElement('afterend', paragraph);
  editor.selection.setCursorLocation(paragraph, 0);
};

export const normalizeContent = (editor: Editor, accordion: HTMLDetailsElement): void => {
  if (isSummary(accordion?.lastChild)) {
    const paragraph = createParagraph(editor);
    accordion.appendChild(paragraph);
    editor.selection.setCursorLocation(paragraph, 0);
  }
};

export const normalizeSummary = (editor: Editor, accordion: HTMLDetailsElement): void => {
  if (!isSummary(accordion?.firstChild)) {
    const summary = createSummary(editor);
    accordion.prepend(summary);
    editor.selection.setCursorLocation(summary, 0);
  }
};

export const normalizeAccordion = (editor: Editor) => (accordion: HTMLDetailsElement): void => {
  normalizeContent(editor, accordion);
  normalizeSummary(editor, accordion);
};

export const normalizeDetails = (editor: Editor): void => {
  Tools.each(
    Tools.grep(editor.dom.select<HTMLDetailsElement>('details', editor.getBody())),
    normalizeAccordion(editor)
  );
};
