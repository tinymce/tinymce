import { Optional } from '@ephox/katamari';
import { Insert, SugarElement, Traverse } from '@ephox/sugar';

import Editor from './api/Editor';
import * as NewLineUtils from './newline/NewLineUtils';

const getTopParentBlock = (editor: Editor, node: Node, root: Element, container: Node): Optional<SugarElement<Node>> => {
  const dom = editor.dom;
  const selector = (node: Node) => dom.isBlock(node) && node.parentElement === root;
  const topParentBlock = selector(node) ? node : dom.getParent(container, selector, root);
  return Optional.from(topParentBlock).map(SugarElement.fromDom);
};

const move = (editor: Editor, up: boolean) => {
  const dom = editor.dom;
  const rng = editor.selection.getRng();
  const node = up ? editor.selection.getStart() : editor.selection.getEnd();
  const container = up ? rng.startContainer : rng.endContainer;
  const root = NewLineUtils.getEditableRoot(dom, container);
  if (!root || !root.isContentEditable) {
    return;
  }
  const bookmark = editor.selection.getBookmark();
  getTopParentBlock(editor, node, root, container).each((parentBlock) => {
    const siblingOpt = up ? Traverse.prevSibling(parentBlock) : Traverse.nextSibling(parentBlock);
    siblingOpt.each((sibling) => {
      const insertFn = up ? Insert.before : Insert.after;
      insertFn(sibling, parentBlock);
      editor.selection.moveToBookmark(bookmark);
    });
  });
};

const moveBlockUp = (editor: Editor): void => move(editor, true);
const moveBlockDown = (editor: Editor): void => move(editor, false);

export {
  moveBlockUp,
  moveBlockDown
};
