/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional, Strings, Unicode } from '@ephox/katamari';
import { Css, PredicateFind, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from '../api/Editor';
import { isAfterBlock, isAtEndOfBlock, isAtStartOfBlock, isBeforeBlock } from '../caret/BlockBoundary';
import { isAfterBr, isBeforeBr } from '../caret/CaretBr';
import * as CaretFinder from '../caret/CaretFinder';
import { CaretPosition } from '../caret/CaretPosition';
import { isAfterSpace, isBeforeSpace } from '../caret/CaretPositionPredicates';
import { getElementFromPosition } from '../caret/CaretUtils';
import * as ElementType from '../dom/ElementType';
import * as NodeType from '../dom/NodeType';
import * as Parents from '../dom/Parents';
import { isContent, isNbsp } from '../text/CharType';

const isInMiddleOfText = (pos: CaretPosition) => CaretPosition.isTextPosition(pos) && !pos.isAtStart() && !pos.isAtEnd();

const getClosestBlock = (root: SugarElement, pos: CaretPosition): SugarElement => {
  const parentBlocks = Arr.filter(Parents.parentsAndSelf(SugarElement.fromDom(pos.container()), root), ElementType.isBlock);
  return Arr.head(parentBlocks).getOr(root);
};

const hasSpaceBefore = (root: SugarElement, pos: CaretPosition): boolean => {
  if (isInMiddleOfText(pos)) {
    return isAfterSpace(pos);
  } else {
    return isAfterSpace(pos) || CaretFinder.prevPosition(getClosestBlock(root, pos).dom, pos).exists(isAfterSpace);
  }
};

const hasSpaceAfter = (root: SugarElement, pos: CaretPosition): boolean => {
  if (isInMiddleOfText(pos)) {
    return isBeforeSpace(pos);
  } else {
    return isBeforeSpace(pos) || CaretFinder.nextPosition(getClosestBlock(root, pos).dom, pos).exists(isBeforeSpace);
  }
};

const isPreValue = (value: string) => Arr.contains([ 'pre', 'pre-wrap' ], value);

const isInPre = (pos: CaretPosition) => getElementFromPosition(pos)
  .bind((elm) => PredicateFind.closest(elm, SugarNode.isElement))
  .exists((elm: SugarElement<Element>) => isPreValue(Css.get(elm, 'white-space')));

const isAtBeginningOfBody = (root: SugarElement, pos: CaretPosition) => CaretFinder.prevPosition(root.dom, pos).isNone();
const isAtEndOfBody = (root: SugarElement, pos: CaretPosition) => CaretFinder.nextPosition(root.dom, pos).isNone();

const isAtLineBoundary = (root: SugarElement, pos: CaretPosition) => (
  isAtBeginningOfBody(root, pos) ||
    isAtEndOfBody(root, pos) ||
    isAtStartOfBlock(root, pos) ||
    isAtEndOfBlock(root, pos) ||
    isAfterBr(root, pos) ||
    isBeforeBr(root, pos)
);

const needsToHaveNbsp = (root: SugarElement, pos: CaretPosition) => {
  if (isInPre(pos)) {
    return false;
  } else {
    return isAtLineBoundary(root, pos) || hasSpaceBefore(root, pos) || hasSpaceAfter(root, pos);
  }
};

const needsToBeNbspLeft = (root: SugarElement, pos: CaretPosition) => {
  if (isInPre(pos)) {
    return false;
  } else {
    return isAtStartOfBlock(root, pos) || isBeforeBlock(root, pos) || isAfterBr(root, pos) || hasSpaceBefore(root, pos);
  }
};

const leanRight = (pos: CaretPosition): CaretPosition => {
  const container = pos.container();
  const offset = pos.offset();

  if (NodeType.isText(container) && offset < container.data.length) {
    return CaretPosition(container, offset + 1);
  } else {
    return pos;
  }
};

const needsToBeNbspRight = (root: SugarElement, pos: CaretPosition) => {
  if (isInPre(pos)) {
    return false;
  } else {
    return isAtEndOfBlock(root, pos) || isAfterBlock(root, pos) || isBeforeBr(root, pos) || hasSpaceAfter(root, pos);
  }
};

const needsToBeNbsp = (root: SugarElement, pos: CaretPosition) => needsToBeNbspLeft(root, pos) || needsToBeNbspRight(root, leanRight(pos));

const isNbspAt = (text: string, offset: number) => isNbsp(text.charAt(offset));

const hasNbsp = (pos: CaretPosition) => {
  const container = pos.container();
  return NodeType.isText(container) && Strings.contains(container.data, Unicode.nbsp);
};

const normalizeNbspMiddle = (text: string): string => {
  const chars = text.split('');
  return Arr.map(chars, (chr, i) => {
    if (isNbsp(chr) && i > 0 && i < chars.length - 1 && isContent(chars[i - 1]) && isContent(chars[i + 1])) {
      return ' ';
    } else {
      return chr;
    }
  }).join('');
};

const normalizeNbspAtStart = (root: SugarElement, node: Text): boolean => {
  const text = node.data;
  const firstPos = CaretPosition(node, 0);

  if (isNbspAt(text, 0) && !needsToBeNbsp(root, firstPos)) {
    node.data = ' ' + text.slice(1);
    return true;
  } else {
    return false;
  }
};

const normalizeNbspInMiddleOfTextNode = (node: Text): boolean => {
  const text = node.data;
  const newText = normalizeNbspMiddle(text);
  if (newText !== text) {
    node.data = newText;
    return true;
  } else {
    return false;
  }
};

const normalizeNbspAtEnd = (root: SugarElement, node: Text): boolean => {
  const text = node.data;
  const lastPos = CaretPosition(node, text.length - 1);
  if (isNbspAt(text, text.length - 1) && !needsToBeNbsp(root, lastPos)) {
    node.data = text.slice(0, -1) + ' ';
    return true;
  } else {
    return false;
  }
};

const normalizeNbsps = (root: SugarElement, pos: CaretPosition): Optional<CaretPosition> => Optional.some(pos).filter(hasNbsp).bind((pos) => {
  const container = pos.container() as Text;
  const normalized = normalizeNbspAtStart(root, container) || normalizeNbspInMiddleOfTextNode(container) || normalizeNbspAtEnd(root, container);
  return normalized ? Optional.some(pos) : Optional.none();
});

const normalizeNbspsInEditor = (editor: Editor) => {
  const root = SugarElement.fromDom(editor.getBody());

  if (editor.selection.isCollapsed()) {
    normalizeNbsps(root, CaretPosition.fromRangeStart(editor.selection.getRng())).each((pos) => {
      editor.selection.setRng(pos.toRange());
    });
  }
};

export {
  needsToBeNbspLeft,
  needsToBeNbspRight,
  needsToBeNbsp,
  needsToHaveNbsp,
  normalizeNbspMiddle,
  normalizeNbspsInEditor
};
