/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { ClientRect, HTMLElement, Node } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import { getClientRects, NodeClientRect } from '../dom/Dimensions';
import * as NodeType from '../dom/NodeType';
import * as GeomClientRect from '../geom/ClientRect';
import * as ArrUtils from '../util/ArrUtils';
import * as CaretCandidate from './CaretCandidate';
import * as CaretUtils from './CaretUtils';
import { isFakeCaretTarget } from './FakeCaret';
import { ClientRectLine, VDirection } from './LineWalker';

export interface CaretInfo {
  node: Node;
  before: boolean;
}

const isContentEditableFalse = NodeType.isContentEditableFalse;
const findNode = CaretUtils.findNode;
const distanceToRectLeft = (clientRect: NodeClientRect, clientX: number) => Math.abs(clientRect.left - clientX);
const distanceToRectRight = (clientRect: NodeClientRect, clientX: number) => Math.abs(clientRect.right - clientX);
const isInsideX = (clientX: number, clientRect: ClientRect): boolean => clientX >= clientRect.left && clientX <= clientRect.right;
const isInsideY = (clientY: number, clientRect: ClientRect): boolean => clientY >= clientRect.top && clientY <= clientRect.bottom;

const findClosestClientRect = (clientRects: ClientRect[], clientX: number): NodeClientRect => ArrUtils.reduce(clientRects, (oldClientRect, clientRect) => {
  const oldDistance = Math.min(distanceToRectLeft(oldClientRect, clientX), distanceToRectRight(oldClientRect, clientX));
  const newDistance = Math.min(distanceToRectLeft(clientRect, clientX), distanceToRectRight(clientRect, clientX));

  if (isInsideX(clientX, clientRect)) {
    return clientRect;
  }

  if (isInsideX(clientX, oldClientRect)) {
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

const walkUntil = (direction: VDirection, root: Node, predicateFn: (node: Node) => boolean, startNode: Node, includeChildren: boolean): void => {
  let node = findNode(startNode, direction, CaretCandidate.isEditableCaretCandidate, root, !includeChildren);
  do {
    if (!node || predicateFn(node)) {
      return;
    }
  } while ((node = findNode(node, direction, CaretCandidate.isEditableCaretCandidate, root)));
};

const findLineNodeRects = (root: Node, targetNodeRect: NodeClientRect, includeChildren: boolean = true): ClientRectLine[] => {
  let clientRects = [];

  const collect = (checkPosFn, node) => {
    const lineRects = Arr.filter(getClientRects([ node ]), function (clientRect) {
      return !checkPosFn(clientRect, targetNodeRect);
    });

    clientRects = clientRects.concat(lineRects);

    return lineRects.length === 0;
  };

  clientRects.push(targetNodeRect);
  walkUntil(VDirection.Up, root, Fun.curry(collect, GeomClientRect.isAbove), targetNodeRect.node, includeChildren);
  walkUntil(VDirection.Down, root, Fun.curry(collect, GeomClientRect.isBelow), targetNodeRect.node, includeChildren);

  return clientRects;
};

const getFakeCaretTargets = (root: HTMLElement): HTMLElement[] => Arr.filter(Arr.from(root.getElementsByTagName('*')), isFakeCaretTarget) as HTMLElement[];

const caretInfo = (clientRect: NodeClientRect, clientX: number): CaretInfo => ({
  node: clientRect.node,
  before: distanceToRectLeft(clientRect, clientX) < distanceToRectRight(clientRect, clientX)
});

const closestFakeCaret = (root: HTMLElement, clientX: number, clientY: number): CaretInfo => {
  const fakeTargetNodeRects = getClientRects(getFakeCaretTargets(root));
  const targetNodeRects = Arr.filter(fakeTargetNodeRects, Fun.curry(isInsideY, clientY));

  let closestNodeRect = findClosestClientRect(targetNodeRects, clientX);
  if (closestNodeRect) {
    // TINY-6057: Don't include children nodes within a table when finding the line
    // rects, as that will never be a valid position for a table fake caret and can
    // lead to performance issues with large tables.
    const includeChildren = !NodeType.isTable(closestNodeRect.node);
    closestNodeRect = findClosestClientRect(findLineNodeRects(root, closestNodeRect, includeChildren), clientX);
    if (closestNodeRect && isFakeCaretTarget(closestNodeRect.node)) {
      return caretInfo(closestNodeRect, clientX);
    }
  }

  return null;
};

export {
  findClosestClientRect,
  findLineNodeRects,
  closestFakeCaret
};
