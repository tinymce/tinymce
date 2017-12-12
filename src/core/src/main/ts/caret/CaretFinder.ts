/**
 * CaretFinder.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import CaretCandidate from './CaretCandidate';
import CaretPosition from './CaretPosition';
import CaretUtils from './CaretUtils';
import CaretWalker from './CaretWalker';
import NodeType from '../dom/NodeType';

var walkToPositionIn = function (forward, rootNode, startNode) {
  var position = forward ? CaretPosition.before(startNode) : CaretPosition.after(startNode);
  return fromPosition(forward, rootNode, position);
};

var afterElement = function (node) {
  return NodeType.isBr(node) ? CaretPosition.before(node) : CaretPosition.after(node);
};

var isBeforeOrStart = function (position) {
  if (CaretPosition.isTextPosition(position)) {
    return position.offset() === 0;
  } else {
    return CaretCandidate.isCaretCandidate(position.getNode());
  }
};

var isAfterOrEnd = function (position) {
  if (CaretPosition.isTextPosition(position)) {
    return position.offset() === position.container().data.length;
  } else {
    return CaretCandidate.isCaretCandidate(position.getNode(true));
  }
};

var isBeforeAfterSameElement = function (from, to) {
  return !CaretPosition.isTextPosition(from) && !CaretPosition.isTextPosition(to) && from.getNode() === to.getNode(true);
};

var isAtBr = function (position) {
  return !CaretPosition.isTextPosition(position) && NodeType.isBr(position.getNode());
};

var shouldSkipPosition = function (forward, from, to) {
  if (forward) {
    return !isBeforeAfterSameElement(from, to) && !isAtBr(from) && isAfterOrEnd(from) && isBeforeOrStart(to);
  } else {
    return !isBeforeAfterSameElement(to, from) && isBeforeOrStart(from) && isAfterOrEnd(to);
  }
};

// Finds: <p>a|<b>b</b></p> -> <p>a<b>|b</b></p>
var fromPosition = function (forward, rootNode, position) {
  var walker = new CaretWalker(rootNode);
  return Option.from(forward ? walker.next(position) : walker.prev(position));
};

// Finds: <p>a|<b>b</b></p> -> <p>a<b>b|</b></p>
var navigate = function (forward, rootNode, from) {
  return fromPosition(forward, rootNode, from).bind(function (to) {
    if (CaretUtils.isInSameBlock(from, to, rootNode) && shouldSkipPosition(forward, from, to)) {
      return fromPosition(forward, rootNode, to);
    } else {
      return Option.some(to);
    }
  });
};

var positionIn = function (forward, element) {
  var startNode = forward ? element.firstChild : element.lastChild;
  if (NodeType.isText(startNode)) {
    return Option.some(new CaretPosition(startNode, forward ? 0 : startNode.data.length));
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

export default <any> {
  fromPosition: fromPosition,
  nextPosition: Fun.curry(fromPosition, true),
  prevPosition: Fun.curry(fromPosition, false),
  navigate: navigate,
  positionIn: positionIn,
  firstPositionIn: Fun.curry(positionIn, true),
  lastPositionIn: Fun.curry(positionIn, false)
};