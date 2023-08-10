import { Optional } from '@ephox/katamari';
import { Insert, SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as Options from '../api/Options';
import * as InputEvents from '../events/InputEvents';
import * as NewLineUtils from './NewLineUtils';

const getTopParentBlock = (editor: Editor, node: Node, root: Element, container: Node): Optional<SugarElement<Node>> => {
  const dom = editor.dom;
  const selector = (node: Node) => dom.isBlock(node) && node.parentElement === root;
  const topParentBlock = selector(node) ? node : dom.getParent(container, selector, root);
  return Optional.from(topParentBlock).map(SugarElement.fromDom);
};

const insert = (editor: Editor, before: boolean): void => {
  const dom = editor.dom;
  const rng = editor.selection.getRng();
  const node = before ? editor.selection.getStart() : editor.selection.getEnd();
  const container = before ? rng.startContainer : rng.endContainer;
  const root = NewLineUtils.getEditableRoot(dom, container);
  if (!root || !root.isContentEditable) {
    return;
  }
  const insertFn = before ? Insert.before : Insert.after;
  const newBlockName = Options.getForcedRootBlock(editor);

  getTopParentBlock(editor, node, root, container).each((parentBlock) => {
    const newBlock = NewLineUtils.createNewBlock(editor, container, parentBlock.dom, root, false, newBlockName);

    insertFn(parentBlock, SugarElement.fromDom(newBlock));
    editor.selection.setCursorLocation(newBlock, 0);
    editor.dispatch('NewBlock', { newBlock });
    InputEvents.fireInputEvent(editor, 'insertParagraph');
  });
};

const insertBefore = (editor: Editor): void => insert(editor, true);
const insertAfter = (editor: Editor): void => insert(editor, false);

export {
  insertBefore,
  insertAfter
};
