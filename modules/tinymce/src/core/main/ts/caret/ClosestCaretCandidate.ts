/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional } from '@ephox/katamari';
import { Compare, SugarElement, Traverse } from '@ephox/sugar';

import { getClientRects, NodeClientRect } from '../dom/Dimensions';
import * as NodeType from '../dom/NodeType';
import * as ClientRect from '../geom/ClientRect';
import * as CaretCandidate from './CaretCandidate';
import { isFakeCaretTarget } from './FakeCaret';

type GeomClientRect = ClientRect.ClientRect;

export enum FakeCaretPosition {
  Before = 'before',
  After = 'after'
}

export interface FakeCaretInfo {
  node: Node;
  position: FakeCaretPosition;
}

type DistanceFn = <T extends GeomClientRect>(rect: T, x: number, y: number) => number;

const distanceToRectLeft = (clientRect: GeomClientRect, clientX: number) => Math.abs(clientRect.left - clientX);
const distanceToRectRight = (clientRect: GeomClientRect, clientX: number) => Math.abs(clientRect.right - clientX);
const isInsideY = <T extends GeomClientRect>(clientY: number, clientRect: T): boolean => clientY >= clientRect.top && clientY <= clientRect.bottom;
const collidesY = <T extends GeomClientRect>(r1: T, r2: T): boolean => r1.top < r2.bottom && r1.bottom > r2.top;

const isOverlapping = <T extends GeomClientRect>(r1: T, r2: T) => {
  // Rectangles might overlap a bit so this checks if the overlap is more than 50% then we count that as on the same line
  const overlap = ClientRect.overlapY(r1, r2) / Math.min(r1.height, r2.height);
  return collidesY(r1, r2) && overlap > 0.5;
};

const splitRectsPerAxis = <T extends GeomClientRect>(rects: T[], y: number): [T[], T[]] => {
  const intersectingRects = Arr.filter(rects, (rect) => isInsideY(y, rect));

  return ClientRect.boundingClientRectFromRects(intersectingRects).fold(
    () => ([[], rects ]),
    (boundingRect) => {
      const { pass: horizontal, fail: vertical } = Arr.partition(rects, (rect) => isOverlapping(rect, boundingRect));
      return [ horizontal, vertical ];
    }
  );
};

const clientInfo = (rect: NodeClientRect, clientX: number): FakeCaretInfo => {
  return {
    node: rect.node,
    position: distanceToRectLeft(rect, clientX) < distanceToRectRight(rect, clientX) ? FakeCaretPosition.Before : FakeCaretPosition.After
  };
};

const horizontalDistance: DistanceFn = (rect, x, _y) => Math.min(Math.abs(rect.left - x), Math.abs(rect.right - x));

const closestChildCaretCandidateNodeRect = (children: ChildNode[], clientX: number, clientY: number): Optional<NodeClientRect> => {
  const findClosestCaretCandidateNodeRect = (rects: NodeClientRect[], distance: DistanceFn): Optional<NodeClientRect> => {
    return Arr.findMap(
      Arr.sort(rects, (r1, r2) => distance(r1, clientX, clientY) - distance(r2, clientX, clientY)),
      (rect) => {
        if (CaretCandidate.isCaretCandidate(rect.node)) {
          return Optional.some(rect);
        } else if (NodeType.isElement(rect.node)) {
          return closestChildCaretCandidateNodeRect(Arr.from(rect.node.childNodes), clientX, clientY);
        } else {
          return Optional.none();
        }
      }
    );
  };

  const [ horizontalRects, verticalRects ] = splitRectsPerAxis(getClientRects(children), clientY);
  const { pass: above, fail: below } = Arr.partition(verticalRects, (rect) => rect.top < clientY);

  return findClosestCaretCandidateNodeRect(horizontalRects, horizontalDistance)
    .orThunk(() => findClosestCaretCandidateNodeRect(below, ClientRect.distanceToRectEdgeFromXY))
    .orThunk(() => findClosestCaretCandidateNodeRect(above, ClientRect.distanceToRectEdgeFromXY));
};

const traverseUp = (rootElm: SugarElement<Node>, scope: SugarElement<Element>, clientX: number, clientY: number): Optional<NodeClientRect> => {
  const helper = (scope: SugarElement<Element>, prevScope: Optional<SugarElement<Element>>) => {
    return prevScope.fold(
      () => closestChildCaretCandidateNodeRect(Arr.from(scope.dom.childNodes), clientX, clientY),
      (prevScope) => {
        const uncheckedChildren = Arr.filter(Arr.from(scope.dom.childNodes), (node) => node !== prevScope.dom);
        return closestChildCaretCandidateNodeRect(uncheckedChildren, clientX, clientY);
      }
    ).orThunk(() => {
      const parent = Compare.eq(scope, rootElm) ? Optional.none() : Traverse.parentElement(scope);
      return parent
        .filter((newScope) => !Compare.eq(newScope, rootElm))
        .bind((newScope) => helper(newScope, Optional.some(scope)));
    });
  };

  return helper(scope, Optional.none());
};

// Rough description of how this algorithm works:
// 1. It starts by finding the element at the specified X, Y coordinate.
// 2. Then it checks its children for the closest one and traverses down into those repeating step 2, 3 until it finds a caret candidate.
// 3. If no caret candidate is found in the closest child node then it checks the second closest and so on until all decendants have been checked.
// 4. If no caret candidate is found, it traverses up skips the element it already checked and checks its siblings using steps 2, 3.
// 5. If no caret candidate is found, it continues step 4 until it finds the root. Then we have checked all the nodes in the document.
//
// This is less accurate but more performant, since for the common case you are likely to find a caret candidate close to where you are clicking.
// The more accurate algorithm would be to read all caret candidates rects in the whole document in and in one big step to find the closest one, but that is just too slow for bigger documents.
const closestCaretCandidateNodeRect = (root: HTMLElement, clientX: number, clientY: number): Optional<NodeClientRect> => {
  const rootElm = SugarElement.fromDom(root);
  const ownerDoc = Traverse.documentOrOwner(rootElm);
  const elementAtPoint = SugarElement.fromPoint(ownerDoc, clientX, clientY).filter((elm) => Compare.contains(rootElm, elm));
  const element = elementAtPoint.getOr(rootElm);

  return traverseUp(rootElm, element, clientX, clientY);
};

const closestFakeCaretCandidate = (root: HTMLElement, clientX: number, clientY: number): Optional<FakeCaretInfo> =>
  closestCaretCandidateNodeRect(root, clientX, clientY)
    .filter((rect) => isFakeCaretTarget(rect.node))
    .map((rect) => clientInfo(rect, clientX));

export {
  closestCaretCandidateNodeRect,
  closestFakeCaretCandidate
};
