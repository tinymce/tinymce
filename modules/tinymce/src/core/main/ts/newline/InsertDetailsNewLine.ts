import { Obj, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Options from '../api/Options';
import * as NodeType from '../dom/NodeType';
import * as NewLineUtils from './NewLineUtils';

export const getDetailsRoot = (editor: Editor, element: Element): HTMLDetailsElement | null =>
  editor.dom.getParent(element, NodeType.isDetails);

const isAtDetailsEdge = (root: HTMLElement, element: Element, isTextBlock: (el: HTMLElement) => boolean) => {
  let node = element;

  while (node && node !== root && Type.isNull(node.nextSibling)) {
    const parent = node.parentElement;

    if (!parent || !isTextBlock(parent)) {
      return NodeType.isDetails(parent);
    }

    node = parent;
  }

  return false;
};

export const isLastEmptyBlockInDetails = (editor: Editor, shiftKey: boolean, element: Element): boolean =>
  !shiftKey &&
  element.nodeName.toLowerCase() === Options.getForcedRootBlock(editor) &&
  editor.dom.isEmpty(element) &&
  isAtDetailsEdge(editor.getBody(), element, (el) => Obj.has(editor.schema.getTextBlockElements(), el.nodeName.toLowerCase()));

export const insertNewLine = (editor: Editor, createNewBlock: (name: string) => Element, parentBlock: Element): void => {
  const newBlock = createNewBlock(Options.getForcedRootBlock(editor));
  const root = getDetailsRoot(editor, parentBlock);
  if (!root) {
    return;
  }
  editor.dom.insertAfter(newBlock, root);
  NewLineUtils.moveToCaretPosition(editor, newBlock);

  // TODO: This now only works with our Accordions not details with multiple root level children should we support that
  if ((parentBlock.parentElement?.childNodes?.length ?? 0) > 1) {
    editor.dom.remove(parentBlock);
  }
};
