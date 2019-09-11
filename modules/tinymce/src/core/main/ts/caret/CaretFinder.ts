/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Option } from '@ephox/katamari';
import * as CaretCandidate from './CaretCandidate';
import CaretPosition from './CaretPosition';
import * as CaretUtils from './CaretUtils';
import { CaretWalker } from './CaretWalker';
import NodeType from '../dom/NodeType';
import { Node, Element, Text } from '@ephox/dom-globals';

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

const navigateIgnore = (forward: boolean, root: Element, from: CaretPosition, ignoreFilter: (pos: CaretPosition) => boolean) => {
  return navigate(forward, root, from).bind((pos) => {
    return ignoreFilter(pos) ? navigateIgnore(forward, root, pos, ignoreFilter) : Option.some(pos);
  });
};

const positionIn = (forward: boolean, element: Node): Option<CaretPosition> => {
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

const nextPosition = Fun.curry(fromPosition, true) as (root: Node, pos: CaretPosition) => Option<CaretPosition>;
const prevPosition = Fun.curry(fromPosition, false) as (root: Node, pos: CaretPosition) => Option<CaretPosition>;

export default {
  fromPosition,
  nextPosition,
  prevPosition,
  navigate,
  navigateIgnore,
  positionIn,
  firstPositionIn: Fun.curry(positionIn, true) as (element: Element) => Option<CaretPosition>,
  lastPositionIn: Fun.curry(positionIn, false) as (element: Element) => Option<CaretPosition>
};
