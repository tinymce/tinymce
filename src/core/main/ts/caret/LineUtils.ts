/**
 * LineUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Fun from '../util/Fun';
import Arr from '../util/Arr';
import NodeType from '../dom/NodeType';
import Dimensions from '../dom/Dimensions';
import ClientRect from '../geom/ClientRect';
import CaretUtils from './CaretUtils';
import CaretCandidate from './CaretCandidate';

/**
 * Utility functions for working with lines.
 *
 * @private
 * @class tinymce.caret.LineUtils
 */

const isContentEditableFalse = NodeType.isContentEditableFalse,
  findNode = CaretUtils.findNode,
  curry = Fun.curry;

const distanceToRectLeft = function (clientRect, clientX) {
  return Math.abs(clientRect.left - clientX);
};

const distanceToRectRight = function (clientRect, clientX) {
  return Math.abs(clientRect.right - clientX);
};

const findClosestClientRect = function (clientRects, clientX) {
  const isInside = function (clientX, clientRect) {
    return clientX >= clientRect.left && clientX <= clientRect.right;
  };

  return Arr.reduce(clientRects, function (oldClientRect, clientRect) {
    let oldDistance, newDistance;

    oldDistance = Math.min(distanceToRectLeft(oldClientRect, clientX), distanceToRectRight(oldClientRect, clientX));
    newDistance = Math.min(distanceToRectLeft(clientRect, clientX), distanceToRectRight(clientRect, clientX));

    if (isInside(clientX, clientRect)) {
      return clientRect;
    }

    if (isInside(clientX, oldClientRect)) {
      return oldClientRect;
    }

    // cE=false has higher priority
    if (newDistance === oldDistance && isContentEditableFalse(clientRect.node)) {
      return clientRect;
    }

    if (newDistance < oldDistance) {
      return clientRect;
    }

    return oldClientRect;
  });
};

const walkUntil = function (direction, rootNode, predicateFn, node) {
  while ((node = findNode(node, direction, CaretCandidate.isEditableCaretCandidate, rootNode))) {
    if (predicateFn(node)) {
      return;
    }
  }
};

const findLineNodeRects = function (rootNode, targetNodeRect) {
  let clientRects = [];

  const collect = function (checkPosFn, node) {
    let lineRects;

    lineRects = Arr.filter(Dimensions.getClientRects(node), function (clientRect) {
      return !checkPosFn(clientRect, targetNodeRect);
    });

    clientRects = clientRects.concat(lineRects);

    return lineRects.length === 0;
  };

  clientRects.push(targetNodeRect);
  walkUntil(-1, rootNode, curry(collect, ClientRect.isAbove), targetNodeRect.node);
  walkUntil(1, rootNode, curry(collect, ClientRect.isBelow), targetNodeRect.node);

  return clientRects;
};

const getContentEditableFalseChildren = function (rootNode) {
  return Arr.filter(Arr.toArray(rootNode.getElementsByTagName('*')), isContentEditableFalse);
};

const caretInfo = function (clientRect, clientX) {
  return {
    node: clientRect.node,
    before: distanceToRectLeft(clientRect, clientX) < distanceToRectRight(clientRect, clientX)
  };
};

const closestCaret = function (rootNode, clientX, clientY) {
  let contentEditableFalseNodeRects, closestNodeRect;

  contentEditableFalseNodeRects = Dimensions.getClientRects(getContentEditableFalseChildren(rootNode));
  contentEditableFalseNodeRects = Arr.filter(contentEditableFalseNodeRects, function (clientRect) {
    return clientY >= clientRect.top && clientY <= clientRect.bottom;
  });

  closestNodeRect = findClosestClientRect(contentEditableFalseNodeRects, clientX);
  if (closestNodeRect) {
    closestNodeRect = findClosestClientRect(findLineNodeRects(rootNode, closestNodeRect), clientX);
    if (closestNodeRect && isContentEditableFalse(closestNodeRect.node)) {
      return caretInfo(closestNodeRect, clientX);
    }
  }

  return null;
};

export default {
  findClosestClientRect,
  findLineNodeRects,
  closestCaret
};