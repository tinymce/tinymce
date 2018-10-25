/**
 * InsertSpace.ts
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr, Option } from '@ephox/katamari';
import CaretPosition from '../caret/CaretPosition';
import { Editor } from '../api/Editor';
import Parents from '../dom/Parents';
import * as ElementType from '../dom/ElementType';
import CaretFinder from '../caret/CaretFinder';
import { Element } from '@ephox/sugar';
import { isAfterSpace, isBeforeSpace } from '../caret/CaretUtils';
import { isAtStartOfBlock, isAtEndOfBlock } from '../caret/BlockBoundary';
import { insertNbspAtPosition, insertSpaceAtPosition } from '../caret/InsertText';
import { isAtBr } from '../caret/CaretBr';

const isNextToSpace = (root: Element, pos: CaretPosition) => {
  const parentBlocks = Arr.filter(Parents.parentsAndSelf(Element.fromDom(pos.container()), root), ElementType.isBlock);
  const scope = Arr.head(parentBlocks).getOr(root);
  if (isBeforeSpace(pos) || isAfterSpace(pos)) {
    return true;
  } else {
    return CaretFinder.isAdjacentTo(scope, pos, (forward, pos) => {
      return forward ? isBeforeSpace(pos) : isAfterSpace(pos);
    });
  }
};

const needsNbsp = (root: Element, pos: CaretPosition) => {
  return isAtStartOfBlock(root, pos) || isAtEndOfBlock(root, pos) || isAtBr(root, pos) || isNextToSpace(root, pos);
};

const insertAtCaret = (root: Element, pos: CaretPosition): Option<CaretPosition> => {
  return needsNbsp(root, pos) ? insertNbspAtPosition(pos) : insertSpaceAtPosition(pos);
};

const insertAtSelection = (editor: Editor): boolean => {
  const pos = CaretPosition.fromRangeStart(editor.selection.getRng());
  const root = Element.fromDom(editor.getBody());

  if (editor.selection.isCollapsed()) {
    return insertAtCaret(root, pos).map((pos) => {
      editor.selection.setRng(pos.toRange());
      return true;
    }).getOr(false);
  } else {
    return false;
  }
};

export {
  insertAtCaret,
  insertAtSelection
};