import { Arr, Fun } from '@ephox/katamari';
import { Compare, Insert, PredicateFind, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from '../api/Editor';
import Schema from '../api/html/Schema';
import CaretPosition from '../caret/CaretPosition';
import { isAtFirstLine, isAtLastLine } from '../caret/LineReader';
import * as ForceBlocks from '../ForceBlocks';

const isTarget = (node: SugarElement<Node>) => Arr.contains([ 'figcaption' ], SugarNode.name(node));

const getClosestTargetBlock = (pos: CaretPosition, root: SugarElement<HTMLElement>, schema: Schema) => {
  const isRoot = Fun.curry(Compare.eq, root);
  return PredicateFind.closest(SugarElement.fromDom(pos.container()), (el) => schema.isBlock(SugarNode.name(el)), isRoot).filter(isTarget);
};

const isAtFirstOrLastLine = (root: SugarElement<HTMLElement>, forward: boolean, pos: CaretPosition) =>
  forward ? isAtLastLine(root.dom, pos) : isAtFirstLine(root.dom, pos);

const moveCaretToNewEmptyLine = (editor: Editor, forward: boolean) => {
  const root = SugarElement.fromDom(editor.getBody());
  const pos = CaretPosition.fromRangeStart(editor.selection.getRng());

  return getClosestTargetBlock(pos, root, editor.schema).exists(() => {
    if (isAtFirstOrLastLine(root, forward, pos)) {
      const insertFn = forward ? Insert.append : Insert.prepend;
      const rng = ForceBlocks.insertEmptyLine(editor, root, insertFn);
      editor.selection.setRng(rng);
      return true;
    } else {
      return false;
    }
  });
};

const moveV = (editor: Editor, forward: boolean): boolean => {
  if (editor.selection.isCollapsed()) {
    return moveCaretToNewEmptyLine(editor, forward);
  } else {
    return false;
  }
};

export {
  moveV
};
