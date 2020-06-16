/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { ClientRect, Document, Element, Node, Range } from '@ephox/dom-globals';
import { Arr, Fun, Options, Unicode } from '@ephox/katamari';
import DOMUtils from '../api/dom/DOMUtils';
import * as NodeType from '../dom/NodeType';
import * as GeomClientRect from '../geom/ClientRect';
import * as RangeNodes from '../selection/RangeNodes';
import * as ExtendingChar from '../text/ExtendingChar';
import * as Predicate from '../util/Predicate';
import * as CaretCandidate from './CaretCandidate';

/**
 * This module contains logic for creating caret positions within a document a caretposition
 * is similar to a DOMRange object but it doesn't have two endpoints and is also more lightweight
 * since it's now updated live when the DOM changes.
 *
 * @private
 * @class tinymce.caret.CaretPosition
 * @example
 * var caretPos1 = CaretPosition(container, offset);
 * var caretPos2 = CaretPosition.fromRangeStart(someRange);
 */

const isElement = NodeType.isElement;
const isCaretCandidate = CaretCandidate.isCaretCandidate;
const isBlock = NodeType.matchStyleValues('display', 'block table');
const isFloated = NodeType.matchStyleValues('float', 'left right');
const isValidElementCaretCandidate = Predicate.and(isElement, isCaretCandidate, Fun.not(isFloated));
const isNotPre = Fun.not(NodeType.matchStyleValues('white-space', 'pre pre-line pre-wrap'));
const isText = NodeType.isText;
const isBr = NodeType.isBr;
const nodeIndex = DOMUtils.nodeIndex;
const resolveIndex = RangeNodes.getNode;
const createRange = (doc: Document): Range => 'createRange' in doc ? doc.createRange() : DOMUtils.DOM.createRng();
const isWhiteSpace = (chr: string): boolean => chr && /[\r\n\t ]/.test(chr);
const isRange = (rng: any): rng is Range => !!rng.setStart && !!rng.setEnd;

const isHiddenWhiteSpaceRange = (range: Range): boolean => {
  const container = range.startContainer;
  const offset = range.startOffset;
  let text;

  if (isWhiteSpace(range.toString()) && isNotPre(container.parentNode) && NodeType.isText(container)) {
    text = container.data;

    if (isWhiteSpace(text[offset - 1]) || isWhiteSpace(text[offset + 1])) {
      return true;
    }
  }

  return false;
};

// Hack for older WebKit versions that doesn't
// support getBoundingClientRect on BR elements
const getBrClientRect = (brNode: Element): ClientRect => {
  const doc = brNode.ownerDocument;
  const rng = createRange(doc);
  const nbsp = doc.createTextNode(Unicode.nbsp);
  const parentNode = brNode.parentNode;

  parentNode.insertBefore(nbsp, brNode);
  rng.setStart(nbsp, 0);
  rng.setEnd(nbsp, 1);
  const clientRect = GeomClientRect.clone(rng.getBoundingClientRect());
  parentNode.removeChild(nbsp);

  return clientRect;
};

// Safari will not return a rect for <p>a<br>|b</p> for some odd reason
const getBoundingClientRectWebKitText = (rng: Range): ClientRect => {
  const sc = rng.startContainer;
  const ec = rng.endContainer;
  const so = rng.startOffset;
  const eo = rng.endOffset;
  if (sc === ec && NodeType.isText(ec) && so === 0 && eo === 1) {
    const newRng = rng.cloneRange();
    newRng.setEndAfter(ec);
    return getBoundingClientRect(newRng);
  } else {
    return null;
  }
};

const isZeroRect = (r) => r.left === 0 && r.right === 0 && r.top === 0 && r.bottom === 0;

const getBoundingClientRect = (item: Element | Range): ClientRect => {
  let clientRect;

  const clientRects = item.getClientRects();
  if (clientRects.length > 0) {
    clientRect = GeomClientRect.clone(clientRects[0]);
  } else {
    clientRect = GeomClientRect.clone(item.getBoundingClientRect());
  }

  if (!isRange(item) && isBr(item) && isZeroRect(clientRect)) {
    return getBrClientRect(item);
  }

  if (isZeroRect(clientRect) && isRange(item)) {
    return getBoundingClientRectWebKitText(item);
  }

  return clientRect;
};

const collapseAndInflateWidth = (clientRect: ClientRect, toStart: boolean): GeomClientRect.ClientRect => {
  const newClientRect = GeomClientRect.collapse(clientRect, toStart);
  newClientRect.width = 1;
  newClientRect.right = newClientRect.left + 1;

  return newClientRect;
};

const getCaretPositionClientRects = (caretPosition: CaretPosition): ClientRect[] => {
  const clientRects = [];
  let beforeNode, node;

  const addUniqueAndValidRect = function (clientRect) {
    if (clientRect.height === 0) {
      return;
    }

    if (clientRects.length > 0) {
      if (GeomClientRect.isEqual(clientRect, clientRects[clientRects.length - 1])) {
        return;
      }
    }

    clientRects.push(clientRect);
  };

  const addCharacterOffset = function (container, offset) {
    const range = createRange(container.ownerDocument);

    if (offset < container.data.length) {
      if (ExtendingChar.isExtendingChar(container.data[offset])) {
        return clientRects;
      }

      // WebKit returns two client rects for a position after an extending
      // character a\uxxx|b so expand on "b" and collapse to start of "b" box
      if (ExtendingChar.isExtendingChar(container.data[offset - 1])) {
        range.setStart(container, offset);
        range.setEnd(container, offset + 1);

        if (!isHiddenWhiteSpaceRange(range)) {
          addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(range), false));
          return clientRects;
        }
      }
    }

    if (offset > 0) {
      range.setStart(container, offset - 1);
      range.setEnd(container, offset);

      if (!isHiddenWhiteSpaceRange(range)) {
        addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(range), false));
      }
    }

    if (offset < container.data.length) {
      range.setStart(container, offset);
      range.setEnd(container, offset + 1);

      if (!isHiddenWhiteSpaceRange(range)) {
        addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(range), true));
      }
    }
  };

  if (isText(caretPosition.container())) {
    addCharacterOffset(caretPosition.container(), caretPosition.offset());
    return clientRects;
  }

  if (isElement(caretPosition.container())) {
    if (caretPosition.isAtEnd()) {
      node = resolveIndex(caretPosition.container(), caretPosition.offset());
      if (isText(node)) {
        addCharacterOffset(node, node.data.length);
      }

      if (isValidElementCaretCandidate(node) && !isBr(node)) {
        addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(node), false));
      }
    } else {
      node = resolveIndex(caretPosition.container(), caretPosition.offset());
      if (isText(node)) {
        addCharacterOffset(node, 0);
      }

      if (isValidElementCaretCandidate(node) && caretPosition.isAtEnd()) {
        addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(node), false));
        return clientRects;
      }

      beforeNode = resolveIndex(caretPosition.container(), caretPosition.offset() - 1);
      if (isValidElementCaretCandidate(beforeNode) && !isBr(beforeNode)) {
        if (isBlock(beforeNode) || isBlock(node) || !isValidElementCaretCandidate(node)) {
          addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(beforeNode), false));
        }
      }

      if (isValidElementCaretCandidate(node)) {
        addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(node), true));
      }
    }
  }

  return clientRects;
};

export interface CaretPosition {
  container: () => Node;
  offset: () => number;
  toRange: () => Range;
  getClientRects: () => ClientRect[];
  isVisible: () => boolean;
  isAtStart: () => boolean;
  isAtEnd: () => boolean;
  isEqual: (caretPosition: CaretPosition) => boolean;
  getNode: (before?: boolean) => Node;
}

/**
 * Represents a location within the document by a container and an offset.
 *
 * @constructor
 * @param {Node} container Container node.
 * @param {Number} offset Offset within that container node.
 * @param {Array} clientRects Optional client rects array for the position.
 */
export function CaretPosition(container: Node, offset: number, clientRects?): CaretPosition {
  const isAtStart = () => {
    if (isText(container)) {
      return offset === 0;
    }

    return offset === 0;
  };

  const isAtEnd = () => {
    if (isText(container)) {
      return offset >= container.data.length;
    }

    return offset >= container.childNodes.length;
  };

  const toRange = (): Range => {
    const range = createRange(container.ownerDocument);
    range.setStart(container, offset);
    range.setEnd(container, offset);

    return range;
  };

  const getClientRects = (): ClientRect[] => {
    if (!clientRects) {
      clientRects = getCaretPositionClientRects(CaretPosition(container, offset));
    }

    return clientRects;
  };

  const isVisible = () => getClientRects().length > 0;

  const isEqual = (caretPosition: CaretPosition) => caretPosition && container === caretPosition.container() && offset === caretPosition.offset();

  const getNode = (before?: boolean): Node => resolveIndex(container, before ? offset - 1 : offset);

  return {
    /**
     * Returns the container node.
     *
     * @method container
     * @return {Node} Container node.
     */
    container: Fun.constant(container),

    /**
     * Returns the offset within the container node.
     *
     * @method offset
     * @return {Number} Offset within the container node.
     */
    offset: Fun.constant(offset),

    /**
     * Returns a range out of a the caret position.
     *
     * @method toRange
     * @return {DOMRange} range for the caret position.
     */
    toRange,

    /**
     * Returns the client rects for the caret position. Might be multiple rects between
     * block elements.
     *
     * @method getClientRects
     * @return {Array} Array of client rects.
     */
    getClientRects,

    /**
     * Returns true if the caret location is visible/displayed on screen.
     *
     * @method isVisible
     * @return {Boolean} true/false if the position is visible or not.
     */
    isVisible,

    /**
     * Returns true if the caret location is at the beginning of text node or container.
     *
     * @method isVisible
     * @return {Boolean} true/false if the position is at the beginning.
     */
    isAtStart,

    /**
     * Returns true if the caret location is at the end of text node or container.
     *
     * @method isVisible
     * @return {Boolean} true/false if the position is at the end.
     */
    isAtEnd,

    /**
     * Compares the caret position to another caret position. This will only compare the
     * container and offset not it's visual position.
     *
     * @method isEqual
     * @param {tinymce.caret.CaretPosition} caretPosition Caret position to compare with.
     * @return {Boolean} true if the caret positions are equal.
     */
    isEqual,

    /**
     * Returns the closest resolved node from a node index. That means if you have an offset after the
     * last node in a container it will return that last node.
     *
     * @method getNode
     * @return {Node} Node that is closest to the index.
     */
    getNode
  };
}

export namespace CaretPosition {
  /**
   * Creates a caret position from the start of a range.
   *
   * @method fromRangeStart
   * @param {DOMRange} range DOM Range to create caret position from.
   * @return {tinymce.caret.CaretPosition} Caret position from the start of DOM range.
   */
  export const fromRangeStart = (range: Range) => CaretPosition(range.startContainer, range.startOffset);

  /**
   * Creates a caret position from the end of a range.
   *
   * @method fromRangeEnd
   * @param {DOMRange} range DOM Range to create caret position from.
   * @return {tinymce.caret.CaretPosition} Caret position from the end of DOM range.
   */
  export const fromRangeEnd = (range: Range) => CaretPosition(range.endContainer, range.endOffset);

  /**
   * Creates a caret position from a node and places the offset after it.
   *
   * @method after
   * @param {Node} node Node to get caret position from.
   * @return {tinymce.caret.CaretPosition} Caret position from the node.
   */
  export const after = (node: Node) => CaretPosition(node.parentNode, nodeIndex(node) + 1);

  /**
   * Creates a caret position from a node and places the offset before it.
   *
   * @method before
   * @param {Node} node Node to get caret position from.
   * @return {tinymce.caret.CaretPosition} Caret position from the node.
   */
  export const before = (node: Node) => CaretPosition(node.parentNode, nodeIndex(node));

  export const isAbove = (pos1: CaretPosition, pos2: CaretPosition): boolean => Options.lift2(Arr.head(pos2.getClientRects()), Arr.last(pos1.getClientRects()), GeomClientRect.isAbove).getOr(false);

  export const isBelow = (pos1: CaretPosition, pos2: CaretPosition): boolean => Options.lift2(Arr.last(pos2.getClientRects()), Arr.head(pos1.getClientRects()), GeomClientRect.isBelow).getOr(false);

  export const isAtStart = (pos: CaretPosition) => pos ? pos.isAtStart() : false;
  export const isAtEnd = (pos: CaretPosition) => pos ? pos.isAtEnd() : false;
  export const isTextPosition = (pos: CaretPosition) => pos ? NodeType.isText(pos.container()) : false;
  export const isElementPosition = (pos: CaretPosition) => isTextPosition(pos) === false;
}

export default CaretPosition;
