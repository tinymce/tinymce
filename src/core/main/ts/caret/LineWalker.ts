/**
 * LineWalker.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Fun from '../util/Fun';
import Arr from '../util/Arr';
import Dimensions from '../dom/Dimensions';
import CaretCandidate from './CaretCandidate';
import CaretUtils from './CaretUtils';
import CaretWalker from './CaretWalker';
import CaretPosition from './CaretPosition';
import ClientRect from '../geom/ClientRect';

/**
 * This module lets you walk the document line by line
 * returing nodes and client rects for each line.
 *
 * @private
 * @class tinymce.caret.LineWalker
 */

const curry = Fun.curry;

const findUntil = function (direction, rootNode, predicateFn, node) {
  while ((node = CaretUtils.findNode(node, direction, CaretCandidate.isEditableCaretCandidate, rootNode))) {
    if (predicateFn(node)) {
      return;
    }
  }
};

const walkUntil = function (direction, isAboveFn, isBeflowFn, rootNode, predicateFn, caretPosition) {
  let line = 0, node;
  const result = [];
  let targetClientRect;

  const add = function (node) {
    let i, clientRect, clientRects;

    clientRects = Dimensions.getClientRects(node);
    if (direction === -1) {
      clientRects = clientRects.reverse();
    }

    for (i = 0; i < clientRects.length; i++) {
      clientRect = clientRects[i];
      if (isBeflowFn(clientRect, targetClientRect)) {
        continue;
      }

      if (result.length > 0 && isAboveFn(clientRect, Arr.last(result))) {
        line++;
      }

      clientRect.line = line;

      if (predicateFn(clientRect)) {
        return true;
      }

      result.push(clientRect);
    }
  };

  targetClientRect = Arr.last(caretPosition.getClientRects());
  if (!targetClientRect) {
    return result;
  }

  node = caretPosition.getNode();
  add(node);
  findUntil(direction, rootNode, add, node);

  return result;
};

const aboveLineNumber = function (lineNumber, clientRect) {
  return clientRect.line > lineNumber;
};

const isLine = function (lineNumber, clientRect) {
  return clientRect.line === lineNumber;
};

const upUntil = curry(walkUntil, -1, ClientRect.isAbove, ClientRect.isBelow);
const downUntil = curry(walkUntil, 1, ClientRect.isBelow, ClientRect.isAbove);

const positionsUntil = function (direction, rootNode, predicateFn, node) {
  const caretWalker = CaretWalker(rootNode);
  let walkFn, isBelowFn, isAboveFn,
    caretPosition;
  const result = [];
  let line = 0, clientRect, targetClientRect;

  const getClientRect = function (caretPosition) {
    if (direction === 1) {
      return Arr.last(caretPosition.getClientRects());
    }

    return Arr.last(caretPosition.getClientRects());
  };

  if (direction === 1) {
    walkFn = caretWalker.next;
    isBelowFn = ClientRect.isBelow;
    isAboveFn = ClientRect.isAbove;
    caretPosition = CaretPosition.after(node);
  } else {
    walkFn = caretWalker.prev;
    isBelowFn = ClientRect.isAbove;
    isAboveFn = ClientRect.isBelow;
    caretPosition = CaretPosition.before(node);
  }

  targetClientRect = getClientRect(caretPosition);

  do {
    if (!caretPosition.isVisible()) {
      continue;
    }

    clientRect = getClientRect(caretPosition);

    if (isAboveFn(clientRect, targetClientRect)) {
      continue;
    }

    if (result.length > 0 && isBelowFn(clientRect, Arr.last(result))) {
      line++;
    }

    clientRect = ClientRect.clone(clientRect);
    clientRect.position = caretPosition;
    clientRect.line = line;

    if (predicateFn(clientRect)) {
      return result;
    }

    result.push(clientRect);
  } while ((caretPosition = walkFn(caretPosition)));

  return result;
};

export default {
  upUntil,
  downUntil,

  /**
   * Find client rects with line and caret position until the predicate returns true.
   *
   * @method positionsUntil
   * @param {Number} direction Direction forward/backward 1/-1.
   * @param {DOMNode} rootNode Root node to walk within.
   * @param {function} predicateFn Gets the client rect as it's input.
   * @param {DOMNode} node Node to start walking from.
   * @return {Array} Array of client rects with line and position properties.
   */
  positionsUntil,

  isAboveLine: curry(aboveLineNumber),
  isLine: curry(isLine)
};