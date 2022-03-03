import { Arr, Fun } from '@ephox/katamari';
import { Attribute, Compare, Insert, PredicateFind, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as Options from '../api/Options';
import CaretPosition from '../caret/CaretPosition';
import { isAtFirstLine, isAtLastLine } from '../caret/LineReader';
import * as ElementType from '../dom/ElementType';

const isTarget = (node: SugarElement) => Arr.contains([ 'figcaption' ], SugarNode.name(node));

const rangeBefore = (target: SugarElement) => {
  const rng = document.createRange();
  rng.setStartBefore(target.dom);
  rng.setEndBefore(target.dom);
  return rng;
};

const insertElement = (root: SugarElement, elm: SugarElement, forward: boolean) => {
  if (forward) {
    Insert.append(root, elm);
  } else {
    Insert.prepend(root, elm);
  }
};

const insertEmptyLine = (root: SugarElement, forward: boolean, blockName: string, attrs: Record<string, string>) => {
  const block = SugarElement.fromTag(blockName);
  const br = SugarElement.fromTag('br');

  Attribute.setAll(block, attrs);
  Insert.append(block, br);
  insertElement(root, block, forward);

  return rangeBefore(br);
};

const getClosestTargetBlock = (pos: CaretPosition, root: SugarElement) => {
  const isRoot = Fun.curry(Compare.eq, root);
  return PredicateFind.closest(SugarElement.fromDom(pos.container()), ElementType.isBlock, isRoot).filter(isTarget);
};

const isAtFirstOrLastLine = (root: SugarElement, forward: boolean, pos: CaretPosition) => forward ? isAtLastLine(root.dom, pos) : isAtFirstLine(root.dom, pos);

const moveCaretToNewEmptyLine = (editor: Editor, forward: boolean) => {
  const root = SugarElement.fromDom(editor.getBody());
  const pos = CaretPosition.fromRangeStart(editor.selection.getRng());
  const rootBlock = Options.getForcedRootBlock(editor);
  const rootBlockAttrs = Options.getForcedRootBlockAttrs(editor);

  return getClosestTargetBlock(pos, root).exists(() => {
    if (isAtFirstOrLastLine(root, forward, pos)) {
      const rng = insertEmptyLine(root, forward, rootBlock, rootBlockAttrs);
      editor.selection.setRng(rng);
      return true;
    } else {
      return false;
    }
  });
};

const moveV = (editor: Editor, forward: boolean) => {
  if (editor.selection.isCollapsed()) {
    return moveCaretToNewEmptyLine(editor, forward);
  } else {
    return false;
  }
};

export {
  moveV
};
