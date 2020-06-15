/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, Node } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import * as NodeType from '../dom/NodeType';
import * as ArrUtils from '../util/ArrUtils';
import * as CaretCandidate from './CaretCandidate';
import CaretPosition from './CaretPosition';
import { findNode, isBackwards, isForwards } from './CaretUtils';

export interface CaretWalker {
  next(caretPosition: CaretPosition): CaretPosition;
  prev(caretPosition: CaretPosition): CaretPosition;
}

/**
 * This module contains logic for moving around a virtual caret in logical order within a DOM element.
 *
 * It ignores the most obvious invalid caret locations such as within a script element or within a
 * contentEditable=false element but it will return locations that isn't possible to render visually.
 *
 * @private
 * @class tinymce.caret.CaretWalker
 * @example
 * var caretWalker = new CaretWalker(rootElm);
 *
 * var prevLogicalCaretPosition = caretWalker.prev(CaretPosition.fromRangeStart(range));
 * var nextLogicalCaretPosition = caretWalker.next(CaretPosition.fromRangeEnd(range));
 */

export enum HDirection {
  Backwards = -1,
  Forwards = 1
}

const isContentEditableFalse = NodeType.isContentEditableFalse;
const isText = NodeType.isText;
const isElement = NodeType.isElement;
const isBr = NodeType.isBr;
const isCaretCandidate = CaretCandidate.isCaretCandidate;
const isAtomic = CaretCandidate.isAtomic;
const isEditableCaretCandidate = CaretCandidate.isEditableCaretCandidate;

const getParents = (node: Node, root: Node): Node[] => {
  const parents = [];

  while (node && node !== root) {
    parents.push(node);
    node = node.parentNode;
  }

  return parents;
};

const nodeAtIndex = (container: Node, offset: number): Node => {
  if (container.hasChildNodes() && offset < container.childNodes.length) {
    return container.childNodes[offset];
  }

  return null;
};

const getCaretCandidatePosition = (direction: HDirection, node: Node): CaretPosition => {
  if (isForwards(direction)) {
    if (isCaretCandidate(node.previousSibling) && !isText(node.previousSibling)) {
      return CaretPosition.before(node);
    }

    if (isText(node)) {
      return CaretPosition(node, 0);
    }
  }

  if (isBackwards(direction)) {
    if (isCaretCandidate(node.nextSibling) && !isText(node.nextSibling)) {
      return CaretPosition.after(node);
    }

    if (isText(node)) {
      return CaretPosition(node, node.data.length);
    }
  }

  if (isBackwards(direction)) {
    if (isBr(node)) {
      return CaretPosition.before(node);
    }

    return CaretPosition.after(node);
  }

  return CaretPosition.before(node);
};

const moveForwardFromBr = (root: Element, nextNode: Node) => {
  const nextSibling = nextNode.nextSibling;

  if (nextSibling && isCaretCandidate(nextSibling)) {
    if (isText(nextSibling)) {
      return CaretPosition(nextSibling, 0);
    } else {
      return CaretPosition.before(nextSibling);
    }
  } else {
    return findCaretPosition(HDirection.Forwards, CaretPosition.after(nextNode), root);
  }
};

const findCaretPosition = (direction: HDirection, startPos: CaretPosition, root: Node): CaretPosition => {
  let node, nextNode, innerNode;
  let caretPosition;

  if (!isElement(root) || !startPos) {
    return null;
  }

  if (startPos.isEqual(CaretPosition.after(root)) && root.lastChild) {
    caretPosition = CaretPosition.after(root.lastChild);
    if (isBackwards(direction) && isCaretCandidate(root.lastChild) && isElement(root.lastChild)) {
      return isBr(root.lastChild) ? CaretPosition.before(root.lastChild) : caretPosition;
    }
  } else {
    caretPosition = startPos;
  }

  const container = caretPosition.container();
  let offset = caretPosition.offset();

  if (isText(container)) {
    if (isBackwards(direction) && offset > 0) {
      return CaretPosition(container, --offset);
    }

    if (isForwards(direction) && offset < container.length) {
      return CaretPosition(container, ++offset);
    }

    node = container;
  } else {
    if (isBackwards(direction) && offset > 0) {
      nextNode = nodeAtIndex(container, offset - 1);
      if (isCaretCandidate(nextNode)) {
        if (!isAtomic(nextNode)) {
          innerNode = findNode(nextNode, direction, isEditableCaretCandidate, nextNode);
          if (innerNode) {
            if (isText(innerNode)) {
              return CaretPosition(innerNode, innerNode.data.length);
            }

            return CaretPosition.after(innerNode);
          }
        }

        if (isText(nextNode)) {
          return CaretPosition(nextNode, nextNode.data.length);
        }

        return CaretPosition.before(nextNode);
      }
    }

    if (isForwards(direction) && offset < container.childNodes.length) {
      nextNode = nodeAtIndex(container, offset);
      if (isCaretCandidate(nextNode)) {
        if (isBr(nextNode)) {
          return moveForwardFromBr(root, nextNode);
        }

        if (!isAtomic(nextNode)) {
          innerNode = findNode(nextNode, direction, isEditableCaretCandidate, nextNode);
          if (innerNode) {
            if (isText(innerNode)) {
              return CaretPosition(innerNode, 0);
            }

            return CaretPosition.before(innerNode);
          }
        }

        if (isText(nextNode)) {
          return CaretPosition(nextNode, 0);
        }

        return CaretPosition.after(nextNode);
      }
    }

    node = nextNode ? nextNode : caretPosition.getNode();
  }

  if ((isForwards(direction) && caretPosition.isAtEnd()) || (isBackwards(direction) && caretPosition.isAtStart())) {
    node = findNode(node, direction, Fun.constant(true), root, true);
    if (isEditableCaretCandidate(node, root)) {
      return getCaretCandidatePosition(direction, node);
    }
  }

  nextNode = findNode(node, direction, isEditableCaretCandidate, root);

  const rootContentEditableFalseElm = ArrUtils.last(Arr.filter(getParents(container, root), isContentEditableFalse));
  if (rootContentEditableFalseElm && (!nextNode || !rootContentEditableFalseElm.contains(nextNode))) {
    if (isForwards(direction)) {
      caretPosition = CaretPosition.after(rootContentEditableFalseElm);
    } else {
      caretPosition = CaretPosition.before(rootContentEditableFalseElm);
    }

    return caretPosition;
  }

  if (nextNode) {
    return getCaretCandidatePosition(direction, nextNode);
  }

  return null;
};

export const CaretWalker = (root: Node): CaretWalker => ({
  /**
     * Returns the next logical caret position from the specified input
     * caretPosition or null if there isn't any more positions left for example
     * at the end specified root element.
     *
     * @method next
     * @param {tinymce.caret.CaretPosition} caretPosition Caret position to start from.
     * @return {tinymce.caret.CaretPosition} CaretPosition or null if no position was found.
     */
  next(caretPosition: CaretPosition): CaretPosition {
    return findCaretPosition(HDirection.Forwards, caretPosition, root);
  },

  /**
     * Returns the previous logical caret position from the specified input
     * caretPosition or null if there isn't any more positions left for example
     * at the end specified root element.
     *
     * @method prev
     * @param {tinymce.caret.CaretPosition} caretPosition Caret position to start from.
     * @return {tinymce.caret.CaretPosition} CaretPosition or null if no position was found.
     */
  prev(caretPosition: CaretPosition): CaretPosition {
    return findCaretPosition(HDirection.Backwards, caretPosition, root);
  }
});
