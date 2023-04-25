import Editor from '../api/Editor';
import * as NewLineUtils from './NewLineUtils';

export const isDetails = (node?: Node | null): node is HTMLDetailsElement =>
  node?.nodeName === 'DETAILS';

export const getDetailsRoot = (editor: Editor, element: Element): HTMLDetailsElement | null =>
  editor.dom.getParent(element, isDetails);

/**
 * Checking only simple structures:
 * 1. Default accordions;
 * 2. Accordions created with the `accordion` plugin.
 */
export const isInDetailsRoot = (element: Element): boolean =>
  isDetails(element.parentNode) || isDetails(element.parentNode?.parentNode);

export const isLastEmptyBlockInDetails = (editor: Editor, shiftKey: boolean, element: Element): boolean => {
  switch (true) {
    case shiftKey:
    case element.nodeName !== 'P':
    case element.parentNode?.lastChild !== element:
    case !editor.dom.isEmpty(element):
    case !isInDetailsRoot(element):
      return false;
    default:
      return true;
  }
};

export const insertParagraph = (editor: Editor, createNewBlock: (name: string) => Element, parentBlock: Element): void => {
  const newBlock = createNewBlock('p');
  const root = getDetailsRoot(editor, parentBlock);
  if (!root) {
    return;
  }
  editor.dom.insertAfter(newBlock, root);
  NewLineUtils.moveToCaretPosition(editor, newBlock);
  editor.dom.remove(parentBlock);
};
