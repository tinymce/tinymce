/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { CaretPosition } from '../caret/CaretPosition';
import { Element, PredicateFind, Node, Css } from '@ephox/sugar';
import { Strings, Option, Arr } from '@ephox/katamari';
import { Editor } from '../api/Editor';
import NodeType from '../dom/NodeType';
import Parents from '../dom/Parents';
import * as ElementType from '../dom/ElementType';
import { isBeforeSpace, isAfterSpace, getElementFromPosition } from '../caret/CaretUtils';
import CaretFinder from '../caret/CaretFinder';
import { isAtStartOfBlock, isAtEndOfBlock } from '../caret/BlockBoundary';
import { Text } from '@ephox/dom-globals';
import { isNbsp, isContent } from '../text/CharType';
import { isAfterBr, isBeforeBr } from 'tinymce/core/caret/CaretBr';

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

const isPreValue = (value: string) => Arr.contains([ 'pre', 'pre-line', 'pre-wrap' ], value);

const isInPre = (pos: CaretPosition) => {
  return getElementFromPosition(pos)
    .bind((elm) => PredicateFind.closest(elm, Node.isElement))
    .exists((elm) => isPreValue(Css.get(elm, 'white-space')));
};

const isAtBeginningOfBody = (root, pos) => CaretFinder.prevPosition(root.dom(), pos).isNone();
const isAtEndOfBody = (root, pos) => CaretFinder.nextPosition(root.dom(), pos).isNone();

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
    return isAtStartOfBlock(root, pos) || isAfterBr(root, pos) || hasSpaceBefore(root, pos);
  }
};

const needsToBeNbspRight = (root: Element, pos: CaretPosition) => {
  if (isInPre(pos)) {
    return false;
  } else {
    return isAtEndOfBlock(root, pos) || isBeforeBr(root, pos) || hasSpaceAfter(root, pos);
  }
};

const isNbspAt = (text: string, offset: number) => {
  return isNbsp(text.charAt(offset));
};

const hasNbsp = (pos: CaretPosition) => {
  const container = pos.container();
  return NodeType.isText(container) && Strings.contains(container.data, nbsp);
};

const normalizeNbspAtStart = (root: Element, node: Text, text: string): string => {
  const firstPos = CaretPosition(node, 0);

  if (isNbspAt(text, 0) && !needsToBeNbspLeft(root, firstPos)) {
    return ' ' + text.slice(1);
  } else {
    return text;
  }
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

const normalizeNbspAtEnd = (root: Element, node: Text, text: string): string => {
  const lastPos = CaretPosition(node, text.length);
  if (isNbspAt(text, text.length - 1) && !needsToBeNbspRight(root, lastPos)) {
    return text.slice(0, -1) + ' ';
  } else {
    return text;
  }
};

const normalizeNbsps = (root: Element, pos: CaretPosition): Option<CaretPosition> => {
  return Option.some(pos).filter(hasNbsp).bind((pos) => {
    const container = pos.container() as Text;
    const text = container.nodeValue;
    const newText = normalizeNbspAtStart(root, container, normalizeNbspMiddle(normalizeNbspAtEnd(root, container, text)));

    if (text !== newText) {
      pos.container().nodeValue = newText;
      return Option.some(pos);
    } else {
      return Option.none();
    }
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
