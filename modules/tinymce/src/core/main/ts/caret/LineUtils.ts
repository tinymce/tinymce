/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Obj } from '@ephox/katamari';

import { getClientRects, NodeClientRect } from '../dom/Dimensions';
import * as NodeType from '../dom/NodeType';
import * as ClientRect from '../geom/ClientRect';
import * as ArrUtils from '../util/ArrUtils';
import * as CaretCandidate from './CaretCandidate';
import * as CaretUtils from './CaretUtils';
import { isFakeCaretTarget } from './FakeCaret';
import { VDirection } from './LineWalker';

type GeomClientRect = ClientRect.ClientRect;

export interface CaretInfo {
  node: Node;
  before: boolean;
}

const isContentEditableFalse = NodeType.isContentEditableFalse;
const findNode = CaretUtils.findNode;
const distanceToRectLeft = (clientRect: GeomClientRect, clientX: number) => Math.abs(clientRect.left - clientX);
const distanceToRectRight = (clientRect: GeomClientRect, clientX: number) => Math.abs(clientRect.right - clientX);
const isInsideX = (clientX: number, clientRect: GeomClientRect): boolean => clientX >= clientRect.left && clientX <= clientRect.right;
const isInsideY = (clientY: number, clientRect: GeomClientRect): boolean => clientY >= clientRect.top && clientY <= clientRect.bottom;
const isNodeClientRect = (rect: GeomClientRect): rect is NodeClientRect => Obj.hasNonNullableKey((rect as any), 'node');

const findClosestClientRect = <T extends GeomClientRect>(clientRects: T[], clientX: number, allowInside: (rect: T) => boolean = Fun.always): T =>
  ArrUtils.reduce(clientRects, (oldClientRect, clientRect) => {
    // Ignore the current rect if it's inside for certain node types
    if (isInsideX(clientX, clientRect)) {
      return allowInside(clientRect) ? clientRect : oldClientRect;
    }

    // Ignore the previous rect if it's inside for certain node types and just use the new rect
    if (isInsideX(clientX, oldClientRect)) {
      return allowInside(oldClientRect) ? oldClientRect : clientRect;
    }

    const oldDistance = Math.min(distanceToRectLeft(oldClientRect, clientX), distanceToRectRight(oldClientRect, clientX));
    const newDistance = Math.min(distanceToRectLeft(clientRect, clientX), distanceToRectRight(clientRect, clientX));

    // cE=false has higher priority
    if (newDistance === oldDistance && isNodeClientRect(clientRect) && isContentEditableFalse(clientRect.node)) {
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

const findLineNodeRects = (root: Node, targetNodeRect: NodeClientRect, includeChildren: boolean = true): NodeClientRect[] => {
  let clientRects: NodeClientRect[] = [];

  const collect = (checkPosFn: (clientRect: GeomClientRect, targetRect: NodeClientRect) => boolean, node: Node) => {
    const lineRects = Arr.filter(getClientRects([ node ]), (clientRect) => {
      return !checkPosFn(clientRect, targetNodeRect);
    });

    clientRects = clientRects.concat(lineRects);

    return lineRects.length === 0;
  };

  clientRects.push(targetNodeRect);
  walkUntil(VDirection.Up, root, Fun.curry(collect, ClientRect.isAbove), targetNodeRect.node, includeChildren);
  walkUntil(VDirection.Down, root, Fun.curry(collect, ClientRect.isBelow), targetNodeRect.node, includeChildren);

  return clientRects;
};

const getFakeCaretTargets = (root: HTMLElement): HTMLElement[] =>
  Arr.filter(Arr.from(root.getElementsByTagName('*')), isFakeCaretTarget) as HTMLElement[];

const caretInfo = (clientRect: NodeClientRect, clientX: number): CaretInfo => ({
  node: clientRect.node,
  before: distanceToRectLeft(clientRect, clientX) < distanceToRectRight(clientRect, clientX)
});

const closestFakeCaret = (root: HTMLElement, clientX: number, clientY: number): CaretInfo => {
  const fakeTargetNodeRects = getClientRects(getFakeCaretTargets(root));
  const targetNodeRects = Arr.filter<NodeClientRect>(fakeTargetNodeRects, Fun.curry(isInsideY, clientY));

  // TINY-6057: Don't include children nodes within a table when finding the line
  // rects, as that will never be a valid position for a table fake caret and can
  // lead to performance issues with large tables.
  const checkInside = (clientRect: NodeClientRect) => !NodeType.isTable(clientRect.node) && !NodeType.isMedia(clientRect.node);

  let closestNodeRect = findClosestClientRect(targetNodeRects, clientX, checkInside);
  if (closestNodeRect) {
    const includeChildren = checkInside(closestNodeRect);
    closestNodeRect = findClosestClientRect(findLineNodeRects(root, closestNodeRect, includeChildren), clientX, checkInside);
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
