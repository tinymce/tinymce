import Editor from '../api/Editor';
import * as NewLineUtils from './NewLineUtils';

export const isDetails = (node?: Node): node is HTMLDetailsElement =>
  node?.nodeName === 'DETAILS';

export const isAccordionBody = (node?: Node | null): node is HTMLDivElement =>
  node?.nodeName === 'DIV' && (node as HTMLDivElement).classList.contains('mce-accordion-body');

export const getAccordionRoot = (editor: Editor, element: Element): HTMLDetailsElement | null =>
  editor.dom.getParent(element, isDetails);

export const isInAccordionBody = (editor: Editor, element: Element): boolean =>
  isAccordionBody(element) || Boolean(editor.dom.getParent(element, isAccordionBody));

export const shouldPreventInsertParagraph = (editor: Editor, shiftKey: boolean, parentBlock: Element): boolean => {
  switch (true) {
    case shiftKey:
    case parentBlock.nodeName !== 'P':
    case parentBlock?.parentNode?.lastChild !== parentBlock:
    case !editor.dom.isEmpty(parentBlock):
    case !isInAccordionBody(editor, parentBlock):
      return false;
    default:
      return true;
  }
};

export const insertParagraph = (editor: Editor, createNewBlock: (name: string) => Element, parentBlock: Element): void => {
  const newBlock = createNewBlock('p');
  const root = getAccordionRoot(editor, parentBlock);
  if (!root) {
    return;
  }
  editor.dom.insertAfter(newBlock, root);
  NewLineUtils.moveToCaretPosition(editor, newBlock);
};
