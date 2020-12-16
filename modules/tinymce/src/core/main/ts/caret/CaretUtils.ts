/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import DomTreeWalker from '../api/dom/TreeWalker';
import * as NodeType from '../dom/NodeType';
import * as CaretCandidate from './CaretCandidate';
import * as CaretContainer from './CaretContainer';
import { CaretPosition } from './CaretPosition';
import { HDirection } from './CaretWalker';
import { isFakeCaretTarget } from './FakeCaret';

const isContentEditableTrue = NodeType.isContentEditableTrue;
const isContentEditableFalse = NodeType.isContentEditableFalse;
const isMedia = NodeType.isMedia;
const isBlockLike = NodeType.matchStyleValues('display', 'block table table-cell table-caption list-item');
const isCaretContainer = CaretContainer.isCaretContainer;
const isCaretContainerBlock = CaretContainer.isCaretContainerBlock;
const isElement = NodeType.isElement;
const isCaretCandidate = CaretCandidate.isCaretCandidate;
const isForwards = (direction: HDirection) => direction > 0;
const isBackwards = (direction: HDirection) => direction < 0;

const skipCaretContainers = (walk, shallow?: boolean): Node => {
  let node;

  while ((node = walk(shallow))) {
    if (!isCaretContainerBlock(node)) {
      return node;
    }
  }

  return null;
};

const findNode = (node: Node, direction: number, predicateFn: (node: Node) => boolean, rootNode: Node, shallow?: boolean) => {
  const walker = new DomTreeWalker(node, rootNode);
  const isCefOrCaretContainer = isContentEditableFalse(node) || isCaretContainerBlock(node);

  if (isBackwards(direction)) {
    if (isCefOrCaretContainer) {
      node = skipCaretContainers(walker.prev.bind(walker), true);
      if (predicateFn(node)) {
        return node;
      }
    }

    while ((node = skipCaretContainers(walker.prev.bind(walker), shallow))) {
      if (predicateFn(node)) {
        return node;
      }
    }
  }

  if (isForwards(direction)) {
    if (isCefOrCaretContainer) {
      node = skipCaretContainers(walker.next.bind(walker), true);
      if (predicateFn(node)) {
        return node;
      }
    }

    while ((node = skipCaretContainers(walker.next.bind(walker), shallow))) {
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

const isInSameBlock = (caretPosition1: CaretPosition, caretPosition2: CaretPosition, rootNode?: Node): boolean => getParentBlock(caretPosition1.container(), rootNode) === getParentBlock(caretPosition2.container(), rootNode);

const isInSameEditingHost = (caretPosition1: CaretPosition, caretPosition2: CaretPosition, rootNode?: Node): boolean => getEditingHost(caretPosition1.container(), rootNode) === getEditingHost(caretPosition2.container(), rootNode);

const getChildNodeAtRelativeOffset = (relativeOffset: number, caretPosition: CaretPosition): Node => {
  if (!caretPosition) {
    return null;
  }

  const container = caretPosition.container();
  const offset = caretPosition.offset();

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

const isNodesInSameBlock = (root: Node, node1: Node, node2: Node): boolean => getParentBlock(node1, root) === getParentBlock(node2, root);

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

    if (isContentEditableFalse(sibling) || isMedia(sibling)) {
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

const before = Fun.curry(beforeAfter, true) as (node: Node) => Range;
const after = Fun.curry(beforeAfter, false) as (node: Node) => Range;

const normalizeRange = (direction: number, root: Node, range: Range): Range => {
  let node, container, location;
  const leanLeft = Fun.curry(lean, true, root);
  const leanRight = Fun.curry(lean, false, root);

  container = range.startContainer;
  const offset = range.startOffset;

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

const getRelativeCefElm = (forward: boolean, caretPosition: CaretPosition): Optional<HTMLElement> =>
  Optional.from(getChildNodeAtRelativeOffset(forward ? 0 : -1, caretPosition)).filter(isContentEditableFalse);

const getNormalizedRangeEndPoint = (direction: number, root: Node, range: Range): CaretPosition => {
  const normalizedRange = normalizeRange(direction, root, range);

  if (direction === -1) {
    return CaretPosition.fromRangeStart(normalizedRange);
  }

  return CaretPosition.fromRangeEnd(normalizedRange);
};

const getElementFromPosition = (pos: CaretPosition): Optional<SugarElement> => Optional.from(pos.getNode()).map(SugarElement.fromDom);
const getElementFromPrevPosition = (pos: CaretPosition): Optional<SugarElement> => Optional.from(pos.getNode(true)).map(SugarElement.fromDom);

const getVisualCaretPosition = (walkFn, caretPosition: CaretPosition): CaretPosition => {
  while ((caretPosition = walkFn(caretPosition))) {
    if (caretPosition.isVisible()) {
      return caretPosition;
    }
  }

  return caretPosition;
};

const isMoveInsideSameBlock = (from: CaretPosition, to: CaretPosition): boolean => {
  const inSameBlock = isInSameBlock(from, to);

  // Handle bogus BR <p>abc|<br></p>
  if (!inSameBlock && NodeType.isBr(from.getNode())) {
    return true;
  }

  return inSameBlock;
};

export {
  isForwards,
  isBackwards,
  findNode,
  getEditingHost,
  getParentBlock,
  isInSameBlock,
  isInSameEditingHost,
  isMoveInsideSameBlock,
  normalizeRange,
  getRelativeCefElm,
  getNormalizedRangeEndPoint,
  getElementFromPosition,
  getElementFromPrevPosition,
  getVisualCaretPosition,
  getChildNodeAtRelativeOffset
};
