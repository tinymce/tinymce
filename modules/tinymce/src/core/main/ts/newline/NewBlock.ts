import { Insert, SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as Options from '../api/Options';
import * as NewLineUtils from './NewLineUtils';

const getTopParentBlock = (node: Node, root: Element, container: Node): Node => {
  let parentBlock = node;

  if (node === root) {
    parentBlock = container;
  }

  while (parentBlock.parentElement && parentBlock.parentElement !== root) {
    parentBlock = parentBlock.parentElement;
  }

  return parentBlock;
};

const insert = (editor: Editor, before: boolean): void => {
  const dom = editor.dom;
  const rng = editor.selection.getRng();
  const node = before ? editor.selection.getStart() : editor.selection.getEnd();
  const container = before ? rng.startContainer : rng.endContainer;
  const editableRoot = NewLineUtils.getEditableRoot(dom, container);
  const root = editableRoot ?? dom.getRoot();

  const parentBlock = getTopParentBlock(node, root, container);

  const newBlockName = Options.getForcedRootBlock(editor);
  const newBlock = dom.create(newBlockName);
  newBlock.innerHTML = '<br data-mce-bogus="1">';
  const insert = before ? Insert.before : Insert.after;
  if (parentBlock) {
    insert(SugarElement.fromDom(parentBlock), SugarElement.fromDom(newBlock));
  }

  NewLineUtils.moveToCaretPosition(editor, newBlock);
};

const insertBefore = (editor: Editor): void => insert(editor, true);
const insertAfter = (editor: Editor): void => insert(editor, false);

export {
  insertBefore,
  insertAfter
};
