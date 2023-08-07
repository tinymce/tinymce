import { Optional } from '@ephox/katamari';
import { Insert, SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as Options from '../api/Options';
import * as InputEvents from '../events/InputEvents';
import * as NewLineUtils from './NewLineUtils';

const getTopParentBlock = (node: Node, root: Element, container: Node): Optional<SugarElement<Node>> => {
  let parentBlock = node;

  if (node === root) {
    parentBlock = container;
  }

  while (parentBlock.parentElement && parentBlock.parentElement !== root) {
    parentBlock = parentBlock.parentElement;
  }

  return Optional.from(SugarElement.fromDom(parentBlock));
};

const insert = (editor: Editor, before: boolean): void => {
  const dom = editor.dom;
  const rng = editor.selection.getRng();
  const node = before ? editor.selection.getStart() : editor.selection.getEnd();
  const container = before ? rng.startContainer : rng.endContainer;
  const root = NewLineUtils.getEditableRoot(dom, container);
  if (!root) {
    return;
  }
  const insertFn = before ? Insert.before : Insert.after;
  const newBlockName = Options.getForcedRootBlock(editor);

  getTopParentBlock(node, root, container).each((parentBlock) => {
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
