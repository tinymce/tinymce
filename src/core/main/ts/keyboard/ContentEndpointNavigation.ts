/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from '../api/Editor';
import CaretPosition from '../caret/CaretPosition';
import { Fun, Arr } from '@ephox/katamari';
import { Insert, Element, Compare, PredicateFind, Node, Attr } from '@ephox/sugar';
import Settings from '../api/Settings';
import { document } from '@ephox/dom-globals';
import * as ElementType from '../dom/ElementType';
import { isAtLastLine, isAtFirstLine } from '../caret/LineReader';

const isTarget = (node: Element) => Arr.contains(['figcaption'], Node.name(node));

const rangeBefore = (target: Element) => {
  const rng = document.createRange();
  rng.setStartBefore(target.dom());
  rng.setEndBefore(target.dom());
  return rng;
};

const insertElement = (root: Element, elm: Element, forward: boolean) => {
  if (forward) {
    Insert.append(root, elm);
  } else {
    Insert.prepend(root, elm);
  }
};

const insertBr = (root: Element, forward: boolean) => {
  const br = Element.fromTag('br');
  insertElement(root, br, forward);
  return rangeBefore(br);
};

const insertBlock = (root: Element, forward: boolean, blockName: string, attrs: Record<string, string>) => {
  const block = Element.fromTag(blockName);
  const br = Element.fromTag('br');

  Attr.setAll(block, attrs);
  Insert.append(block, br);
  insertElement(root, block, forward);

  return rangeBefore(br);
};

const insertEmptyLine = (root: Element, rootBlockName: string, attrs: Record<string, string>, forward: boolean) => {
  if (rootBlockName === '') {
    return insertBr(root, forward);
  } else {
    return insertBlock(root, forward, rootBlockName, attrs);
  }
};

const getClosestTargetBlock = (pos: CaretPosition, root: Element) => {
  const isRoot = Fun.curry(Compare.eq, root);
  return PredicateFind.closest(Element.fromDom(pos.container()), ElementType.isBlock, isRoot).filter(isTarget);
};

const isAtFirstOrLastLine = (root: Element, forward: boolean, pos: CaretPosition) => {
  return forward ? isAtLastLine(root.dom(), pos) : isAtFirstLine(root.dom(), pos);
};

const moveCaretToNewEmptyLine = (editor: Editor, forward: boolean) => {
  const root = Element.fromDom(editor.getBody());
  const pos = CaretPosition.fromRangeStart(editor.selection.getRng());
  const rootBlock = Settings.getForcedRootBlock(editor);
  const rootBlockAttrs = Settings.getForcedRootBlockAttrs(editor);

  return getClosestTargetBlock(pos, root).exists(() => {
    if (isAtFirstOrLastLine(root, forward, pos)) {
      const rng = insertEmptyLine(root, rootBlock, rootBlockAttrs, forward);
      editor.selection.setRng(rng);
      return true;
    } else {
      return false;
    }
  });
};

const moveV = (editor: Editor, forward: boolean) => () => {
  if (editor.selection.isCollapsed()) {
    return moveCaretToNewEmptyLine(editor, forward);
  } else {
    return false;
  }
};

export {
  moveV
};