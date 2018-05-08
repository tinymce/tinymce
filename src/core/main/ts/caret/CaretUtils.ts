/**
 * CaretUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Fun from '../util/Fun';
import TreeWalker from '../api/dom/TreeWalker';
import NodeType from '../dom/NodeType';
import * as CaretContainer from './CaretContainer';
import * as CaretCandidate from './CaretCandidate';
import { CaretPosition } from 'tinymce/core/caret/CaretPosition';
import { Option } from '@ephox/katamari';
import { HDirection } from 'tinymce/core/caret/CaretWalker';
import { isFakeCaretTarget } from 'tinymce/core/caret/FakeCaret';

const isContentEditableTrue = NodeType.isContentEditableTrue;
const isContentEditableFalse = NodeType.isContentEditableFalse;
const isBlockLike = NodeType.matchStyleValues('display', 'block table table-cell table-caption list-item');
const isCaretContainer = CaretContainer.isCaretContainer;
const isCaretContainerBlock = CaretContainer.isCaretContainerBlock;
const curry = Fun.curry;
const isElement = NodeType.isElement;
const isCaretCandidate = CaretCandidate.isCaretCandidate;
const isForwards = (direction: HDirection) => direction > 0;
const isBackwards = (direction: HDirection) => direction < 0;

const skipCaretContainers = function (walk, shallow?: boolean): Node {
  let node;

  while ((node = walk(shallow))) {
    if (!isCaretContainerBlock(node)) {
      return node;
    }
  }

  return null;
};

const findNode = (node: Node, direction: number, predicateFn: (node: Node) => boolean, rootNode: Node, shallow?: boolean) => {
  const walker = new TreeWalker(node, rootNode);

  if (isBackwards(direction)) {
    if (isContentEditableFalse(node) || isCaretContainerBlock(node)) {
      node = skipCaretContainers(walker.prev, true);
      if (predicateFn(node)) {
        return node;
      }
    }

    while ((node = skipCaretContainers(walker.prev, shallow))) {
      if (predicateFn(node)) {
        return node;
      }
    }
  }

  if (isForwards(direction)) {
    if (isContentEditableFalse(node) || isCaretContainerBlock(node)) {
      node = skipCaretContainers(walker.next, true);
      if (predicateFn(node)) {
        return node;
      }
    }

    while ((node = skipCaretContainers(walker.next, shallow))) {
      if (predicateFn(node)) {
        return node;
      }
    }
  }

  return null;
};

const getEditingHost = (node: Node, rootNode: Node) => {
  for (node = node.parentNode; node && node !== rootNode; node = node.parentNode) {
    if (isContentEditableTrue(node)) {
      return node;
    }
  }

  return rootNode;
};

const getParentBlock = (node: Node, rootNode?: Node) => {
  while (node && node !== rootNode) {
    if (isBlockLike(node)) {
      return node;
    }

    node = node.parentNode;
  }

  return null;
};

const isInSameBlock = (caretPosition1: CaretPosition, caretPosition2: CaretPosition, rootNode?: Node): boolean => {
  return getParentBlock(caretPosition1.container(), rootNode) === getParentBlock(caretPosition2.container(), rootNode);
};

const isInSameEditingHost = (caretPosition1: CaretPosition, caretPosition2: CaretPosition, rootNode?: Node): boolean => {
  return getEditingHost(caretPosition1.container(), rootNode) === getEditingHost(caretPosition2.container(), rootNode);
};

const getChildNodeAtRelativeOffset = (relativeOffset: number, caretPosition: CaretPosition): Node => {
  let container, offset;

  if (!caretPosition) {
    return null;
  }

  container = caretPosition.container();
  offset = caretPosition.offset();

  if (!isElement(container)) {
    return null;
  }

  return container.childNodes[offset + relativeOffset];
};

const beforeAfter = (before: boolean, node: Node): Range => {
  const range = node.ownerDocument.createRange();

  if (before) {
    range.setStartBefore(node);
    range.setEndBefore(node);
  } else {
    range.setStartAfter(node);
    range.setEndAfter(node);
  }

  return range;
};

const isNodesInSameBlock = (root: Node, node1: Node, node2: Node): boolean => {
  return getParentBlock(node1, root) === getParentBlock(node2, root);
};

const lean = (left: boolean, root: Node, node: Node): Node => {
  let sibling, siblingName;

  if (left) {
    siblingName = 'previousSibling';
  } else {
    siblingName = 'nextSibling';
  }

  while (node && node !== root) {
    sibling = node[siblingName];

    if (isCaretContainer(sibling)) {
      sibling = sibling[siblingName];
    }

    if (isContentEditableFalse(sibling)) {
      if (isNodesInSameBlock(root, sibling, node)) {
        return sibling;
      }

      break;
    }

    if (isCaretCandidate(sibling)) {
      break;
    }

    node = node.parentNode;
  }

  return null;
};

const before = curry(beforeAfter, true) as (node: Node) => Range;
const after = curry(beforeAfter, false) as (node: Node) => Range;

const normalizeRange = (direction: number, root: Node, range: Range): Range => {
  let node, container, offset, location;
  const leanLeft = curry(lean, true, root);
  const leanRight = curry(lean, false, root);

  container = range.startContainer;
  offset = range.startOffset;

  if (CaretContainer.isCaretContainerBlock(container)) {
    if (!isElement(container)) {
      container = container.parentNode;
    }

    location = container.getAttribute('data-mce-caret');

    if (location === 'before') {
      node = container.nextSibling;
      if (isFakeCaretTarget(node)) {
        return before(node);
      }
    }

    if (location === 'after') {
      node = container.previousSibling;
      if (isFakeCaretTarget(node)) {
        return after(node);
      }
    }
  }

  if (!range.collapsed) {
    return range;
  }

  if (NodeType.isText(container)) {
    if (isCaretContainer(container)) {
      if (direction === 1) {
        node = leanRight(container);
        if (node) {
          return before(node);
        }

        node = leanLeft(container);
        if (node) {
          return after(node);
        }
      }

      if (direction === -1) {
        node = leanLeft(container);
        if (node) {
          return after(node);
        }

        node = leanRight(container);
        if (node) {
          return before(node);
        }
      }

      return range;
    }

    if (CaretContainer.endsWithCaretContainer(container) && offset >= container.data.length - 1) {
      if (direction === 1) {
        node = leanRight(container);
        if (node) {
          return before(node);
        }
      }

      return range;
    }

    if (CaretContainer.startsWithCaretContainer(container) && offset <= 1) {
      if (direction === -1) {
        node = leanLeft(container);
        if (node) {
          return after(node);
        }
      }

      return range;
    }

    if (offset === container.data.length) {
      node = leanRight(container);
      if (node) {
        return before(node);
      }

      return range;
    }

    if (offset === 0) {
      node = leanLeft(container);
      if (node) {
        return after(node);
      }

      return range;
    }
  }

  return range;
};

const isNextToContentEditableFalse = (relativeOffset: number, caretPosition: CaretPosition) => {
  const node = getChildNodeAtRelativeOffset(relativeOffset, caretPosition);
  return isContentEditableFalse(node) && !NodeType.isBogusAll(node);
};

const isNextToTable = (relativeOffset: number, caretPosition: CaretPosition) => {
  return NodeType.isTable(getChildNodeAtRelativeOffset(relativeOffset, caretPosition));
};

const getRelativeCefElm = (forward: boolean, caretPosition: CaretPosition) => {
  return Option.from(getChildNodeAtRelativeOffset(forward ? 0 : -1, caretPosition)).filter(isContentEditableFalse);
};

const getNormalizedRangeEndPoint = (direction: number, root: Node, range: Range): CaretPosition => {
  const normalizedRange = normalizeRange(direction, root, range);

  if (direction === -1) {
    return CaretPosition.fromRangeStart(normalizedRange);
  }

  return CaretPosition.fromRangeEnd(normalizedRange);
};

const isBeforeContentEditableFalse = curry(isNextToContentEditableFalse, 0) as (caretPosition: CaretPosition) => boolean;
const isAfterContentEditableFalse = curry(isNextToContentEditableFalse, -1) as (caretPosition: CaretPosition) => boolean;
const isBeforeTable = curry(isNextToTable, 0) as (caretPosition: CaretPosition) => boolean;
const isAfterTable = curry(isNextToTable, -1) as (caretPosition: CaretPosition) => boolean;

export {
  isForwards,
  isBackwards,
  findNode,
  getEditingHost,
  getParentBlock,
  isInSameBlock,
  isInSameEditingHost,
  isBeforeContentEditableFalse,
  isAfterContentEditableFalse,
  isBeforeTable,
  isAfterTable,
  normalizeRange,
  getRelativeCefElm,
  getNormalizedRangeEndPoint
};