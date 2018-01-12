/**
 * CaretPosition.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import CaretCandidate from './CaretCandidate';
import DOMUtils from '../dom/DOMUtils';
import NodeType from '../dom/NodeType';
import ClientRect from '../geom/ClientRect';
import RangeNodes from '../selection/RangeNodes';
import ExtendingChar from '../text/ExtendingChar';
import Fun from '../util/Fun';

/**
 * This module contains logic for creating caret positions within a document a caretposition
 * is similar to a DOMRange object but it doesn't have two endpoints and is also more lightweight
 * since it's now updated live when the DOM changes.
 *
 * @private
 * @class tinymce.caret.CaretPosition
 * @example
 * var caretPos1 = new CaretPosition(container, offset);
 * var caretPos2 = CaretPosition.fromRangeStart(someRange);
 */

const isElement = NodeType.isElement,
  isCaretCandidate = CaretCandidate.isCaretCandidate,
  isBlock = NodeType.matchStyleValues('display', 'block table'),
  isFloated = NodeType.matchStyleValues('float', 'left right'),
  isValidElementCaretCandidate = Fun.and(isElement, isCaretCandidate, Fun.negate(isFloated)),
  isNotPre = Fun.negate(NodeType.matchStyleValues('white-space', 'pre pre-line pre-wrap')),
  isText = NodeType.isText,
  isBr = NodeType.isBr,
  nodeIndex = DOMUtils.nodeIndex,
  resolveIndex = RangeNodes.getNode;

const createRange = function (doc) {
  return 'createRange' in doc ? doc.createRange() : DOMUtils.DOM.createRng();
};

const isWhiteSpace = function (chr) {
  return chr && /[\r\n\t ]/.test(chr);
};

const isHiddenWhiteSpaceRange = function (range) {
  const container = range.startContainer;
  const offset = range.startOffset;
  let text;

  if (isWhiteSpace(range.toString()) && isNotPre(container.parentNode)) {
    text = container.data;

    if (isWhiteSpace(text[offset - 1]) || isWhiteSpace(text[offset + 1])) {
      return true;
    }
  }

  return false;
};

const getCaretPositionClientRects = function (caretPosition) {
  const clientRects = [];
  let beforeNode, node;

  // Hack for older WebKit versions that doesn't
  // support getBoundingClientRect on BR elements
  const getBrClientRect = function (brNode) {
    const doc = brNode.ownerDocument;
    const rng = createRange(doc);
    const nbsp = doc.createTextNode('\u00a0');
    const parentNode = brNode.parentNode;
    let clientRect;

    parentNode.insertBefore(nbsp, brNode);
    rng.setStart(nbsp, 0);
    rng.setEnd(nbsp, 1);
    clientRect = ClientRect.clone(rng.getBoundingClientRect());
    parentNode.removeChild(nbsp);

    return clientRect;
  };

  const getBoundingClientRect = function (item) {
    let clientRect, clientRects;

    clientRects = item.getClientRects();
    if (clientRects.length > 0) {
      clientRect = ClientRect.clone(clientRects[0]);
    } else {
      clientRect = ClientRect.clone(item.getBoundingClientRect());
    }

    if (isBr(item) && clientRect.left === 0) {
      return getBrClientRect(item);
    }

    return clientRect;
  };

  const collapseAndInflateWidth = function (clientRect, toStart) {
    clientRect = ClientRect.collapse(clientRect, toStart);
    clientRect.width = 1;
    clientRect.right = clientRect.left + 1;

    return clientRect;
  };

  const addUniqueAndValidRect = function (clientRect) {
    if (clientRect.height === 0) {
      return;
    }

    if (clientRects.length > 0) {
      if (ClientRect.isEqual(clientRect, clientRects[clientRects.length - 1])) {
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

/**
 * Represents a location within the document by a container and an offset.
 *
 * @constructor
 * @param {Node} container Container node.
 * @param {Number} offset Offset within that container node.
 * @param {Array} clientRects Optional client rects array for the position.
 */
const CaretPosition: any = function (container, offset, clientRects) {
  const isAtStart = function () {
    if (isText(container)) {
      return offset === 0;
    }

    return offset === 0;
  };

  const isAtEnd = function () {
    if (isText(container)) {
      return offset >= container.data.length;
    }

    return offset >= container.childNodes.length;
  };

  const toRange = function () {
    let range;

    range = createRange(container.ownerDocument);
    range.setStart(container, offset);
    range.setEnd(container, offset);

    return range;
  };

  const getClientRects = function () {
    if (!clientRects) {
      clientRects = getCaretPositionClientRects(new CaretPosition(container, offset));
    }

    return clientRects;
  };

  const isVisible = function () {
    return getClientRects().length > 0;
  };

  const isEqual = function (caretPosition) {
    return caretPosition && container === caretPosition.container() && offset === caretPosition.offset();
  };

  const getNode = function (before) {
    return resolveIndex(container, before ? offset - 1 : offset);
  };

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
};

/**
 * Creates a caret position from the start of a range.
 *
 * @method fromRangeStart
 * @param {DOMRange} range DOM Range to create caret position from.
 * @return {tinymce.caret.CaretPosition} Caret position from the start of DOM range.
 */
CaretPosition.fromRangeStart = function (range) {
  return new CaretPosition(range.startContainer, range.startOffset);
};

/**
 * Creates a caret position from the end of a range.
 *
 * @method fromRangeEnd
 * @param {DOMRange} range DOM Range to create caret position from.
 * @return {tinymce.caret.CaretPosition} Caret position from the end of DOM range.
 */
CaretPosition.fromRangeEnd = function (range) {
  return new CaretPosition(range.endContainer, range.endOffset);
};

/**
 * Creates a caret position from a node and places the offset after it.
 *
 * @method after
 * @param {Node} node Node to get caret position from.
 * @return {tinymce.caret.CaretPosition} Caret position from the node.
 */
CaretPosition.after = function (node) {
  return new CaretPosition(node.parentNode, nodeIndex(node) + 1);
};

/**
 * Creates a caret position from a node and places the offset before it.
 *
 * @method before
 * @param {Node} node Node to get caret position from.
 * @return {tinymce.caret.CaretPosition} Caret position from the node.
 */
CaretPosition.before = function (node) {
  return new CaretPosition(node.parentNode, nodeIndex(node));
};

CaretPosition.isAtStart = function (pos) {
  return pos ? pos.isAtStart() : false;
};

CaretPosition.isAtEnd = function (pos) {
  return pos ? pos.isAtEnd() : false;
};

CaretPosition.isTextPosition = function (pos) {
  return pos ? NodeType.isText(pos.container()) : false;
};

export default CaretPosition;