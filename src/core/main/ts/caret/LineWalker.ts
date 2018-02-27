/**
 * LineWalker.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Arr from '../util/Arr';
import * as Dimensions from '../dom/Dimensions';
import * as CaretCandidate from './CaretCandidate';
import * as CaretUtils from './CaretUtils';
import { CaretWalker } from './CaretWalker';
import CaretPosition from './CaretPosition';
import * as ClientRect from '../geom/ClientRect';
import { Fun } from '@ephox/katamari';

export interface ClientRectLine extends ClientRect {
  line: number;
}

export enum VDirection {
  Up = -1,
  Down = 1
}

type PosPredicate = (rect1: ClientRect, rect2: ClientRect) => boolean;
type RectPredicate = (rect: ClientRectLine) => boolean;

const findUntil = (direction: VDirection, root: Node, predicateFn: (node: Node) => boolean, node: Node): void => {
  while ((node = CaretUtils.findNode(node, direction, CaretCandidate.isEditableCaretCandidate, root))) {
    if (predicateFn(node)) {
      return;
    }
  }
};

const walkUntil = (direction: VDirection, isAboveFn: PosPredicate, isBeflowFn: PosPredicate, root: Node, predicateFn: RectPredicate, caretPosition: CaretPosition): ClientRectLine[] => {
  let line = 0, node;
  const result = [];
  let targetClientRect;

  const add = function (node: Node) {
    let i, clientRect, clientRects;

    clientRects = Dimensions.getClientRects([node]);
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
  findUntil(direction, root, add, node);

  return result;
};

const aboveLineNumber = (lineNumber: number, clientRect: ClientRectLine) => clientRect.line > lineNumber;
const isLineNumber = (lineNumber: number, clientRect: ClientRectLine) => clientRect.line === lineNumber;
const upUntil = Fun.curry(walkUntil, VDirection.Up, ClientRect.isAbove, ClientRect.isBelow) as (root: Node, predicateFn: RectPredicate, caretPosition: CaretPosition) => ClientRectLine[];
const downUntil = Fun.curry(walkUntil, VDirection.Down, ClientRect.isBelow, ClientRect.isAbove) as (root: Node, predicateFn: RectPredicate, caretPosition: CaretPosition) => ClientRectLine[];

const positionsUntil = (direction: VDirection, root: Node, predicateFn: RectPredicate, node: Node): ClientRectLine[] => {
  const caretWalker = CaretWalker(root);
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

const isAboveLine = (lineNumber: number) => (clientRect: ClientRectLine) => aboveLineNumber(lineNumber, clientRect);
const isLine = (lineNumber: number) => (clientRect: ClientRectLine) => isLineNumber(lineNumber, clientRect);

export {
  upUntil,
  downUntil,
  positionsUntil,
  isAboveLine,
  isLine
};