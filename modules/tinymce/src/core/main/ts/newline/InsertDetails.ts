import Editor from '../api/Editor';
import * as NewLineUtils from './NewLineUtils';

export const isDetails = (node?: Node | null): node is HTMLDetailsElement =>
  node?.nodeName === 'DETAILS';

export const getDetailsRoot = (editor: Editor, element: Element): HTMLDetailsElement | null =>
  editor.dom.getParent(element, isDetails);

export const isLastEmptyBlockInDetails = (editor: Editor, shiftKey: boolean, element: Element): boolean => {
  switch (true) {
    case shiftKey:
    case element.nodeName !== 'P':
    case element.parentNode?.lastChild !== element:
    case !editor.dom.isEmpty(element):
    case !isDetails(element.parentNode):
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
  if (root.children.length > 2) {
    editor.dom.remove(parentBlock);
  }
};
