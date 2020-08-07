/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import * as Dimensions from '../dom/Dimensions';
import * as ClientRect from '../geom/ClientRect';
import * as ArrUtils from '../util/ArrUtils';
import * as CaretCandidate from './CaretCandidate';
import CaretPosition from './CaretPosition';
import * as CaretUtils from './CaretUtils';
import { CaretWalker } from './CaretWalker';

interface LineClientRect extends ClientRect.ClientRect {
  line: number;
}

export interface LinePosClientRect extends LineClientRect {
  position: CaretPosition;
}

export interface LineNodeClientRect extends Dimensions.NodeClientRect, LineClientRect { }

export enum VDirection {
  Up = -1,
  Down = 1
}

type PosPredicate = (rect1: ClientRect.ClientRect, rect2: ClientRect.ClientRect) => boolean;
type RectPredicate = (rect: LinePosClientRect) => boolean;

const findUntil = (direction: VDirection, root: Node, predicateFn: (node: Node) => boolean, node: Node): void => {
  while ((node = CaretUtils.findNode(node, direction, CaretCandidate.isEditableCaretCandidate, root))) {
    if (predicateFn(node)) {
      return;
    }
  }
};

const walkUntil = (direction: VDirection, isAboveFn: PosPredicate, isBeflowFn: PosPredicate, root: Node, predicateFn: RectPredicate, caretPosition: CaretPosition): LineNodeClientRect[] => {
  let line = 0;
  const result = [];

  const add = function (node: Node) {
    let i, clientRect, clientRects;

    clientRects = Dimensions.getClientRects([ node ]);
    if (direction === -1) {
      clientRects = clientRects.reverse();
    }

    for (i = 0; i < clientRects.length; i++) {
      clientRect = clientRects[i];
      if (isBeflowFn(clientRect, targetClientRect)) {
        continue;
      }

      if (result.length > 0 && isAboveFn(clientRect, ArrUtils.last(result))) {
        line++;
      }

      clientRect.line = line;

      if (predicateFn(clientRect)) {
        return true;
      }

      result.push(clientRect);
    }
  };

  const targetClientRect = ArrUtils.last(caretPosition.getClientRects());
  if (!targetClientRect) {
    return result;
  }

  const node = caretPosition.getNode();
  add(node);
  findUntil(direction, root, add, node);

  return result;
};

const aboveLineNumber = <T extends LineClientRect>(lineNumber: number, clientRect: T) => clientRect.line > lineNumber;
const isLineNumber = <T extends LineClientRect>(lineNumber: number, clientRect: T) => clientRect.line === lineNumber;
const upUntil = Fun.curry(walkUntil, VDirection.Up, ClientRect.isAbove, ClientRect.isBelow) as (root: Node, predicateFn: RectPredicate, caretPosition: CaretPosition) => LineNodeClientRect[];
const downUntil = Fun.curry(walkUntil, VDirection.Down, ClientRect.isBelow, ClientRect.isAbove) as (root: Node, predicateFn: RectPredicate, caretPosition: CaretPosition) => LineNodeClientRect[];

const positionsUntil = (direction: VDirection, root: Node, predicateFn: RectPredicate, node: Node): LinePosClientRect[] => {
  const caretWalker = CaretWalker(root);
  let walkFn, isBelowFn, isAboveFn,
    caretPosition;
  const result = [];
  let line = 0, clientRect;

  const getClientRect = function (caretPosition) {
    if (direction === 1) {
      return ArrUtils.last(caretPosition.getClientRects());
    }

    return ArrUtils.last(caretPosition.getClientRects());
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

  const targetClientRect = getClientRect(caretPosition);

  do {
    if (!caretPosition.isVisible()) {
      continue;
    }

    clientRect = getClientRect(caretPosition);

    if (isAboveFn(clientRect, targetClientRect)) {
      continue;
    }

    if (result.length > 0 && isBelowFn(clientRect, ArrUtils.last(result))) {
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

const isAboveLine = (lineNumber: number) => <T extends LineClientRect>(clientRect: T) => aboveLineNumber(lineNumber, clientRect);
const isLine = (lineNumber: number) => <T extends LineClientRect>(clientRect: T) => isLineNumber(lineNumber, clientRect);

export {
  upUntil,
  downUntil,
  positionsUntil,
  isAboveLine,
  isLine
};
