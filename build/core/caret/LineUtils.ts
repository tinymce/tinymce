/**
 * LineUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Arr from '../util/Arr';
import NodeType from '../dom/NodeType';
import { NodeClientRect, getClientRects } from '../dom/Dimensions';
import * as ClientRect from '../geom/ClientRect';
import * as CaretUtils from './CaretUtils';
import * as CaretCandidate from './CaretCandidate';
import { Fun } from '@ephox/katamari';
import { ClientRectLine, VDirection } from 'tinymce/core/caret/LineWalker';
import { isFakeCaretTarget } from 'tinymce/core/caret/FakeCaret';

export interface CaretInfo {
  node: Node;
  before: boolean;
}

const isContentEditableFalse = NodeType.isContentEditableFalse;
const findNode = CaretUtils.findNode;
const distanceToRectLeft = (clientRect: NodeClientRect, clientX: number) => Math.abs(clientRect.left - clientX);
const distanceToRectRight = (clientRect: NodeClientRect, clientX: number) => Math.abs(clientRect.right - clientX);
const isInside = (clientX: number, clientRect: ClientRect): boolean => clientX >= clientRect.left && clientX <= clientRect.right;

const findClosestClientRect = (clientRects: ClientRect[], clientX: number): NodeClientRect => {
  return Arr.reduce(clientRects, (oldClientRect, clientRect) => {
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

const walkUntil = (direction: VDirection, root: Node, predicateFn: (node: Node) => boolean, node: Node): void => {
  while ((node = findNode(node, direction, CaretCandidate.isEditableCaretCandidate, root))) {
    if (predicateFn(node)) {
      return;
    }
  }
};

const findLineNodeRects = (root: Node, targetNodeRect: NodeClientRect): ClientRectLine[] => {
  let clientRects = [];

  const collect = (checkPosFn, node) => {
    let lineRects;

    lineRects = Arr.filter(getClientRects([node]), function (clientRect) {
      return !checkPosFn(clientRect, targetNodeRect);
    });

    clientRects = clientRects.concat(lineRects);

    return lineRects.length === 0;
  };

  clientRects.push(targetNodeRect);
  walkUntil(VDirection.Up, root, Fun.curry(collect, ClientRect.isAbove), targetNodeRect.node);
  walkUntil(VDirection.Down, root, Fun.curry(collect, ClientRect.isBelow), targetNodeRect.node);

  return clientRects;
};

const getFakeCaretTargets = (root: HTMLElement): HTMLElement[] => {
  return Arr.filter(Arr.toArray(root.getElementsByTagName('*')), isFakeCaretTarget);
};

const caretInfo = (clientRect: NodeClientRect, clientX: number): CaretInfo => {
  return {
    node: clientRect.node,
    before: distanceToRectLeft(clientRect, clientX) < distanceToRectRight(clientRect, clientX)
  };
};

const closestCaret = (root: HTMLElement, clientX: number, clientY: number): CaretInfo => {
  let closestNodeRect;

  const contentEditableFalseNodeRects = getClientRects(getFakeCaretTargets(root));
  const targetNodeRects = Arr.filter(contentEditableFalseNodeRects, (rect) => clientY >= rect.top && clientY <= rect.bottom);

  closestNodeRect = findClosestClientRect(targetNodeRects, clientX);
  if (closestNodeRect) {
    closestNodeRect = findClosestClientRect(findLineNodeRects(root, closestNodeRect), clientX);
    if (closestNodeRect && isFakeCaretTarget(closestNodeRect.node)) {
      return caretInfo(closestNodeRect, clientX);
    }
  }

  return null;
};

export {
  findClosestClientRect,
  findLineNodeRects,
  closestCaret
};