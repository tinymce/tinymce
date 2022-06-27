import { Arr, Fun, Optionals, Type, Unicode } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import * as NodeType from '../dom/NodeType';
import * as ClientRect from '../geom/ClientRect';
import * as RangeNodes from '../selection/RangeNodes';
import * as ExtendingChar from '../text/ExtendingChar';
import * as Predicate from '../util/Predicate';
import * as CaretCandidate from './CaretCandidate';

type GeomClientRect = ClientRect.ClientRect;

/**
 * This module contains logic for creating caret positions within a document a caretposition
 * is similar to a DOMRange object but it doesn't have two endpoints and is also more lightweight
 * since it's now updated live when the DOM changes.
 *
 * @private
 * @class tinymce.caret.CaretPosition
 * @example
 * const caretPos1 = CaretPosition(container, offset);
 * const caretPos2 = CaretPosition.fromRangeStart(someRange);
 */

const isElement = NodeType.isElement;
const isCaretCandidate = CaretCandidate.isCaretCandidate;
const isBlock = NodeType.matchStyleValues('display', 'block table');
const isFloated = NodeType.matchStyleValues('float', 'left right');
const isValidElementCaretCandidate = Predicate.and(isElement, isCaretCandidate, Fun.not(isFloated)) as (node: Node | undefined) => node is Element;
const isNotPre = Fun.not(NodeType.matchStyleValues('white-space', 'pre pre-line pre-wrap'));
const isText = NodeType.isText;
const isBr = NodeType.isBr;
const nodeIndex = DOMUtils.nodeIndex;
const resolveIndex = RangeNodes.getNodeUnsafe;
const createRange = (doc: Document | null): Range => doc ? doc.createRange() : DOMUtils.DOM.createRng();
const isWhiteSpace = (chr: string | undefined): boolean => Type.isString(chr) && /[\r\n\t ]/.test(chr);
const isRange = (rng: any): rng is Range => !!rng.setStart && !!rng.setEnd;

const isHiddenWhiteSpaceRange = (range: Range): boolean => {
  const container = range.startContainer;
  const offset = range.startOffset;

  if (isWhiteSpace(range.toString()) && isNotPre(container.parentNode) && NodeType.isText(container)) {
    const text = container.data;

    if (isWhiteSpace(text[offset - 1]) || isWhiteSpace(text[offset + 1])) {
      return true;
    }
  }

  return false;
};

// Hack for older WebKit versions that doesn't
// support getBoundingClientRect on BR elements
const getBrClientRect = (brNode: Element): GeomClientRect => {
  const doc = brNode.ownerDocument;
  const rng = createRange(doc);
  const nbsp = doc.createTextNode(Unicode.nbsp);
  const parentNode = brNode.parentNode as Node;

  parentNode.insertBefore(nbsp, brNode);
  rng.setStart(nbsp, 0);
  rng.setEnd(nbsp, 1);
  const clientRect = ClientRect.clone(rng.getBoundingClientRect());
  parentNode.removeChild(nbsp);

  return clientRect;
};

// Safari will not return a rect for <p>a<br>|b</p> for some odd reason
const getBoundingClientRectWebKitText = (rng: Range): GeomClientRect | null => {
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

const isZeroRect = (r: GeomClientRect): boolean =>
  r.left === 0 && r.right === 0 && r.top === 0 && r.bottom === 0;

const getBoundingClientRect = (item: Element | Range): GeomClientRect => {
  let clientRect: GeomClientRect;

  const clientRects = item.getClientRects();
  if (clientRects.length > 0) {
    clientRect = ClientRect.clone(clientRects[0]);
  } else {
    clientRect = ClientRect.clone(item.getBoundingClientRect());
  }

  if (!isRange(item) && isBr(item) && isZeroRect(clientRect)) {
    return getBrClientRect(item);
  }

  if (isZeroRect(clientRect) && isRange(item)) {
    return getBoundingClientRectWebKitText(item) ?? clientRect;
  }

  return clientRect;
};

const collapseAndInflateWidth = (clientRect: GeomClientRect, toStart: boolean): GeomClientRect => {
  const newClientRect = ClientRect.collapse(clientRect, toStart);
  newClientRect.width = 1;
  newClientRect.right = newClientRect.left + 1;

  return newClientRect;
};

const getCaretPositionClientRects = (caretPosition: CaretPosition): GeomClientRect[] => {
  const clientRects: GeomClientRect[] = [];

  const addUniqueAndValidRect = (clientRect: GeomClientRect) => {
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

  const addCharacterOffset = (container: Text, offset: number): void => {
    const range = createRange(container.ownerDocument);

    if (offset < container.data.length) {
      if (ExtendingChar.isExtendingChar(container.data[offset])) {
        return;
      }

      // WebKit returns two client rects for a position after an extending
      // character a\uxxx|b so expand on "b" and collapse to start of "b" box
      if (ExtendingChar.isExtendingChar(container.data[offset - 1])) {
        range.setStart(container, offset);
        range.setEnd(container, offset + 1);

        if (!isHiddenWhiteSpaceRange(range)) {
          addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(range), false));
          return;
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

  const container = caretPosition.container();
  const offset = caretPosition.offset();
  if (isText(container)) {
    addCharacterOffset(container, offset);
    return clientRects;
  }

  if (isElement(container)) {
    if (caretPosition.isAtEnd()) {
      const node = resolveIndex(container, offset);
      if (isText(node)) {
        addCharacterOffset(node, node.data.length);
      }

      if (isValidElementCaretCandidate(node) && !isBr(node)) {
        addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(node), false));
      }
    } else {
      const node = resolveIndex(container, offset);
      if (isText(node)) {
        addCharacterOffset(node, 0);
      }

      if (isValidElementCaretCandidate(node) && caretPosition.isAtEnd()) {
        addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(node), false));
        return clientRects;
      }

      const beforeNode = resolveIndex(caretPosition.container(), caretPosition.offset() - 1);
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
  getClientRects: () => GeomClientRect[];
  isVisible: () => boolean;
  isAtStart: () => boolean;
  isAtEnd: () => boolean;
  isEqual: (caretPosition: CaretPosition) => boolean;
  getNode: (before?: boolean) => Node | undefined;
}

/**
 * Represents a location within the document by a container and an offset.
 *
 * @constructor
 * @param {Node} container Container node.
 * @param {Number} offset Offset within that container node.
 * @param {Array} clientRects Optional client rects array for the position.
 */
export const CaretPosition = (container: Node, offset: number, clientRects?: GeomClientRect[]): CaretPosition => {
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

  const getClientRects = (): GeomClientRect[] => {
    if (!clientRects) {
      clientRects = getCaretPositionClientRects(CaretPosition(container, offset));
    }

    return clientRects;
  };

  const isVisible = () => getClientRects().length > 0;

  const isEqual = (caretPosition: CaretPosition) => caretPosition && container === caretPosition.container() && offset === caretPosition.offset();

  const getNode = (before?: boolean): Node | undefined =>
    resolveIndex(container, before ? offset - 1 : offset);

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
CaretPosition.fromRangeStart = (range: Range) => CaretPosition(range.startContainer, range.startOffset);

/**
 * Creates a caret position from the end of a range.
 *
 * @method fromRangeEnd
 * @param {DOMRange} range DOM Range to create caret position from.
 * @return {tinymce.caret.CaretPosition} Caret position from the end of DOM range.
 */
CaretPosition.fromRangeEnd = (range: Range) => CaretPosition(range.endContainer, range.endOffset);

/**
 * Creates a caret position from a node and places the offset after it.
 *
 * @method after
 * @param {Node} node Node to get caret position from.
 * @return {tinymce.caret.CaretPosition} Caret position from the node.
 */
// TODO: TINY-8865 - This may not be safe to cast as Node and alternative solutions need to be looked into
CaretPosition.after = (node: Node) => CaretPosition(node.parentNode as Node, nodeIndex(node) + 1);

/**
 * Creates a caret position from a node and places the offset before it.
 *
 * @method before
 * @param {Node} node Node to get caret position from.
 * @return {tinymce.caret.CaretPosition} Caret position from the node.
 */
// TODO: TINY-8865 - This may not be safe to cast as Node and alternative solutions need to be looked into
CaretPosition.before = (node: Node) => CaretPosition(node.parentNode as Node, nodeIndex(node));

CaretPosition.isAbove = (pos1: CaretPosition, pos2: CaretPosition): boolean =>
  Optionals.lift2(Arr.head(pos2.getClientRects()), Arr.last(pos1.getClientRects()), ClientRect.isAbove).getOr(false);

CaretPosition.isBelow = (pos1: CaretPosition, pos2: CaretPosition): boolean =>
  Optionals.lift2(Arr.last(pos2.getClientRects()), Arr.head(pos1.getClientRects()), ClientRect.isBelow).getOr(false);

CaretPosition.isAtStart = (pos: CaretPosition) => pos ? pos.isAtStart() : false;
CaretPosition.isAtEnd = (pos: CaretPosition) => pos ? pos.isAtEnd() : false;
CaretPosition.isTextPosition = (pos: CaretPosition) => pos ? NodeType.isText(pos.container()) : false;
CaretPosition.isElementPosition = (pos: CaretPosition) => !CaretPosition.isTextPosition(pos);

export default CaretPosition;
