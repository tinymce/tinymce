/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from '../api/util/Tools';
import * as NodeType from '../dom/NodeType';

const hasCeProperty = (node) => {
  return NodeType.isContentEditableTrue(node) || NodeType.isContentEditableFalse(node);
};

const findParent = (node, rootNode, predicate) => {
  while (node && node !== rootNode) {
    if (predicate(node)) {
      return node;
    }

    node = node.parentNode;
  }

  return null;
};

/**
 * Finds the closest selection rect tries to get the range from that.
 */
const findClosestIeRange = (clientX, clientY, doc) => {
  let rects;

  let element = doc.elementFromPoint(clientX, clientY);
  const rng = doc.body.createTextRange();

  if (!element || element.tagName === 'HTML') {
    element = doc.body;
  }

  rng.moveToElementText(element);
  rects = Tools.toArray(rng.getClientRects());

  rects = rects.sort((a, b) => {
    a = Math.abs(Math.max(a.top - clientY, a.bottom - clientY));
    b = Math.abs(Math.max(b.top - clientY, b.bottom - clientY));

    return a - b;
  });

  if (rects.length > 0) {
    clientY = (rects[0].bottom + rects[0].top) / 2;

    try {
      rng.moveToPoint(clientX, clientY);
      rng.collapse(true);

      return rng;
    } catch (ex) {
      // At least we tried
    }
  }

  return null;
};

const moveOutOfContentEditableFalse = (rng, rootNode) => {
  const parentElement = rng && rng.parentElement ? rng.parentElement() : null;
  return NodeType.isContentEditableFalse(findParent(parentElement, rootNode, hasCeProperty)) ? null : rng;
};

const fromPoint = (clientX: number, clientY: number, doc: Document): Range => {
  let rng, point;
  const pointDoc = doc as any;

  if (pointDoc.caretPositionFromPoint) {
    point = pointDoc.caretPositionFromPoint(clientX, clientY);
    if (point) {
      rng = doc.createRange();
      rng.setStart(point.offsetNode, point.offset);
      rng.collapse(true);
    }
  } else if (pointDoc.caretRangeFromPoint) {
    rng = pointDoc.caretRangeFromPoint(clientX, clientY);
  } else if (pointDoc.body.createTextRange) {
    rng = pointDoc.body.createTextRange();

    try {
      rng.moveToPoint(clientX, clientY);
      rng.collapse(true);
    } catch (ex) {
      rng = findClosestIeRange(clientX, clientY, doc);
    }

    return moveOutOfContentEditableFalse(rng, doc.body);
  }

  return rng;
};

export {
  fromPoint
};
