/**
 * CaretFinder.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun, Option } from '@ephox/katamari';
import * as CaretCandidate from './CaretCandidate';
import CaretPosition from './CaretPosition';
import * as CaretUtils from './CaretUtils';
import { CaretWalker } from './CaretWalker';
import NodeType from '../dom/NodeType';

const walkToPositionIn = (forward: boolean, root: Node, start: Node) => {
  const position = forward ? CaretPosition.before(start) : CaretPosition.after(start);
  return fromPosition(forward, root, position);
};

const afterElement = (node): CaretPosition => {
  return NodeType.isBr(node) ? CaretPosition.before(node) : CaretPosition.after(node);
};

const isBeforeOrStart = (position: CaretPosition): boolean => {
  if (CaretPosition.isTextPosition(position)) {
    return position.offset() === 0;
  } else {
    return CaretCandidate.isCaretCandidate(position.getNode());
  }
};

const isAfterOrEnd = (position: CaretPosition): boolean => {
  if (CaretPosition.isTextPosition(position)) {
    const container = position.container() as Text;
    return position.offset() === container.data.length;
  } else {
    return CaretCandidate.isCaretCandidate(position.getNode(true));
  }
};

const isBeforeAfterSameElement = (from: CaretPosition, to: CaretPosition): boolean => {
  return !CaretPosition.isTextPosition(from) && !CaretPosition.isTextPosition(to) && from.getNode() === to.getNode(true);
};

const isAtBr = (position: CaretPosition): boolean => {
  return !CaretPosition.isTextPosition(position) && NodeType.isBr(position.getNode());
};

const shouldSkipPosition = (forward: boolean, from: CaretPosition, to: CaretPosition) => {
  if (forward) {
    return !isBeforeAfterSameElement(from, to) && !isAtBr(from) && isAfterOrEnd(from) && isBeforeOrStart(to);
  } else {
    return !isBeforeAfterSameElement(to, from) && isBeforeOrStart(from) && isAfterOrEnd(to);
  }
};

// Finds: <p>a|<b>b</b></p> -> <p>a<b>|b</b></p>
const fromPosition = function (forward: boolean, root: Node, pos: CaretPosition) {
  const walker = CaretWalker(root);
  return Option.from(forward ? walker.next(pos) : walker.prev(pos));
};

// Finds: <p>a|<b>b</b></p> -> <p>a<b>b|</b></p>
const navigate = (forward: boolean, root: Element, from: CaretPosition) => {
  return fromPosition(forward, root, from).bind(function (to) {
    if (CaretUtils.isInSameBlock(from, to, root) && shouldSkipPosition(forward, from, to)) {
      return fromPosition(forward, root, to);
    } else {
      return Option.some(to);
    }
  });
};

const positionIn = (forward: boolean, element: Element): Option<CaretPosition> => {
  const startNode = forward ? element.firstChild : element.lastChild;
  if (NodeType.isText(startNode)) {
    return Option.some(CaretPosition(startNode, forward ? 0 : startNode.data.length));
  } else if (startNode) {
    if (CaretCandidate.isCaretCandidate(startNode)) {
      return Option.some(forward ? CaretPosition.before(startNode) : afterElement(startNode));
    } else {
      return walkToPositionIn(forward, element, startNode);
    }
  } else {
    return Option.none();
  }
};

export default {
  fromPosition,
  nextPosition: Fun.curry(fromPosition, true) as (root: Node, pos: CaretPosition) => Option<CaretPosition>,
  prevPosition: Fun.curry(fromPosition, false) as (root: Node, pos: CaretPosition) => Option<CaretPosition>,
  navigate,
  positionIn,
  firstPositionIn: Fun.curry(positionIn, true) as (element: Element) => Option<CaretPosition>,
  lastPositionIn: Fun.curry(positionIn, false) as (element: Element) => Option<CaretPosition>
};