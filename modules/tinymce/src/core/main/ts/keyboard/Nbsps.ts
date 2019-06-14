/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Text } from '@ephox/dom-globals';
import { Strings, Option, Arr } from '@ephox/katamari';
import { Element, PredicateFind, Node, Css } from '@ephox/sugar';
import { CaretPosition } from '../caret/CaretPosition';
import Editor from '../api/Editor';
import NodeType from '../dom/NodeType';
import Parents from '../dom/Parents';
import * as ElementType from '../dom/ElementType';
import { getElementFromPosition } from '../caret/CaretUtils';
import CaretFinder from '../caret/CaretFinder';
import { isAtStartOfBlock, isAtEndOfBlock, isAfterBlock, isBeforeBlock } from '../caret/BlockBoundary';
import { isNbsp, isContent } from '../text/CharType';
import { isAfterBr, isBeforeBr } from '../caret/CaretBr';
import { isAfterSpace, isBeforeSpace } from '../caret/CaretPositionPredicates';

const nbsp = '\u00a0';

const isInMiddleOfText = (pos: CaretPosition) => CaretPosition.isTextPosition(pos) && !pos.isAtStart() && !pos.isAtEnd();

const getClosestBlock = (root: Element, pos: CaretPosition): Element => {
  const parentBlocks = Arr.filter(Parents.parentsAndSelf(Element.fromDom(pos.container()), root), ElementType.isBlock);
  return Arr.head(parentBlocks).getOr(root);
};

const hasSpaceBefore = (root: Element, pos: CaretPosition): boolean => {
  if (isInMiddleOfText(pos)) {
    return isAfterSpace(pos);
  } else {
    return isAfterSpace(pos) || CaretFinder.prevPosition(getClosestBlock(root, pos).dom(), pos).exists(isAfterSpace);
  }
};

const hasSpaceAfter = (root: Element, pos: CaretPosition): boolean => {
  if (isInMiddleOfText(pos)) {
    return isBeforeSpace(pos);
  } else {
    return isBeforeSpace(pos) || CaretFinder.nextPosition(getClosestBlock(root, pos).dom(), pos).exists(isBeforeSpace);
  }
};

const isPreValue = (value: string) => Arr.contains([ 'pre', 'pre-wrap' ], value);

const isInPre = (pos: CaretPosition) => {
  return getElementFromPosition(pos)
    .bind((elm) => PredicateFind.closest(elm, Node.isElement))
    .exists((elm) => isPreValue(Css.get(elm, 'white-space')));
};

const isAtBeginningOfBody = (root: Element, pos: CaretPosition) => CaretFinder.prevPosition(root.dom(), pos).isNone();
const isAtEndOfBody = (root: Element, pos: CaretPosition) => CaretFinder.nextPosition(root.dom(), pos).isNone();

const isAtLineBoundary = (root: Element, pos: CaretPosition) => {
  return (
    isAtBeginningOfBody(root, pos) ||
    isAtEndOfBody(root, pos) ||
    isAtStartOfBlock(root, pos) ||
    isAtEndOfBlock(root, pos) ||
    isAfterBr(root, pos) ||
    isBeforeBr(root, pos)
  );
};

const needsToHaveNbsp = (root: Element, pos: CaretPosition) => {
  if (isInPre(pos)) {
    return false;
  } else {
    return isAtLineBoundary(root, pos) || hasSpaceBefore(root, pos) || hasSpaceAfter(root, pos);
  }
};

const needsToBeNbspLeft = (root: Element, pos: CaretPosition) => {
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

const needsToBeNbspRight = (root: Element, pos: CaretPosition) => {
  const afterPos = leanRight(pos);
  if (isInPre(afterPos)) {
    return false;
  } else {
    return isAtEndOfBlock(root, afterPos) || isAfterBlock(root, afterPos) || isBeforeBr(root, afterPos) || hasSpaceAfter(root, afterPos);
  }
};

const needsToBeNbsp = (root: Element, pos: CaretPosition) => {
  return needsToBeNbspLeft(root, pos) || needsToBeNbspRight(root, pos);
};

const isNbspAt = (text: string, offset: number) => {
  return isNbsp(text.charAt(offset));
};

const hasNbsp = (pos: CaretPosition) => {
  const container = pos.container();
  return NodeType.isText(container) && Strings.contains(container.data, nbsp);
};

const normalizeNbspMiddle = (text: string): string => {
  return Arr.map(text.split(''), (chr, i, chars) => {
    if (isNbsp(chr) && i > 0 && i < chars.length - 1 && isContent(chars[i - 1]) && isContent(chars[i + 1])) {
      return ' ';
    } else {
      return chr;
    }
  }).join('');
};

const normalizeNbspAtStart = (root: Element, node: Text): boolean => {
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

const normalizeNbspAtEnd = (root: Element, node: Text): boolean => {
  const text = node.data;
  const lastPos = CaretPosition(node, text.length - 1);
  if (isNbspAt(text, text.length - 1) && !needsToBeNbsp(root, lastPos)) {
    node.data = text.slice(0, -1) + ' ';
    return true;
  } else {
    return false;
  }
};

const normalizeNbsps = (root: Element, pos: CaretPosition): Option<CaretPosition> => {
  return Option.some(pos).filter(hasNbsp).bind((pos) => {
    const container = pos.container() as Text;
    const normalized = normalizeNbspAtStart(root, container) || normalizeNbspInMiddleOfTextNode(container) || normalizeNbspAtEnd(root, container);
    return normalized ? Option.some(pos) : Option.none();
  });
};

const normalizeNbspsInEditor = (editor: Editor) => {
  const root = Element.fromDom(editor.getBody());

  if (editor.selection.isCollapsed()) {
    normalizeNbsps(root, CaretPosition.fromRangeStart(editor.selection.getRng())).each((pos) => {
      editor.selection.setRng(pos.toRange());
    });
  }
};

export {
  needsToHaveNbsp,
  normalizeNbspMiddle,
  normalizeNbspsInEditor
};
