/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun } from '@ephox/katamari';
import { Attribute, Compare, Insert, PredicateFind, SugarElement, SugarNode } from '@ephox/sugar';
import Editor from '../api/Editor';
import * as Settings from '../api/Settings';
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

const insertBr = (root: SugarElement, forward: boolean) => {
  const br = SugarElement.fromTag('br');
  insertElement(root, br, forward);
  return rangeBefore(br);
};

const insertBlock = (root: SugarElement, forward: boolean, blockName: string, attrs: Record<string, string>) => {
  const block = SugarElement.fromTag(blockName);
  const br = SugarElement.fromTag('br');

  Attribute.setAll(block, attrs);
  Insert.append(block, br);
  insertElement(root, block, forward);

  return rangeBefore(br);
};

const insertEmptyLine = (root: SugarElement, rootBlockName: string, attrs: Record<string, string>, forward: boolean) => {
  if (rootBlockName === '') {
    return insertBr(root, forward);
  } else {
    return insertBlock(root, forward, rootBlockName, attrs);
  }
};

const getClosestTargetBlock = (pos: CaretPosition, root: SugarElement) => {
  const isRoot = Fun.curry(Compare.eq, root);
  return PredicateFind.closest(SugarElement.fromDom(pos.container()), ElementType.isBlock, isRoot).filter(isTarget);
};

const isAtFirstOrLastLine = (root: SugarElement, forward: boolean, pos: CaretPosition) => forward ? isAtLastLine(root.dom, pos) : isAtFirstLine(root.dom, pos);

const moveCaretToNewEmptyLine = (editor: Editor, forward: boolean) => {
  const root = SugarElement.fromDom(editor.getBody());
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
