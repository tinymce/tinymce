/**
 * ClientRect.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

export interface ClientRect {
  left: number;
  top: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

const round = Math.round;

const clone = (rect: ClientRect): ClientRect => {
  if (!rect) {
    return { left: 0, top: 0, bottom: 0, right: 0, width: 0, height: 0 };
  }

  return {
    left: round(rect.left),
    top: round(rect.top),
    bottom: round(rect.bottom),
    right: round(rect.right),
    width: round(rect.width),
    height: round(rect.height)
  };
};

const collapse = (rect: ClientRect, toStart: boolean): ClientRect => {
  rect = clone(rect);

  if (toStart) {
    rect.right = rect.left;
  } else {
    rect.left = rect.left + rect.width;
    rect.right = rect.left;
  }

  rect.width = 0;

  return rect;
};

const isEqual = (rect1: ClientRect, rect2: ClientRect): boolean => {
  return (
    rect1.left === rect2.left &&
    rect1.top === rect2.top &&
    rect1.bottom === rect2.bottom &&
    rect1.right === rect2.right
  );
};

const isValidOverflow = (overflowY: number, rect1: ClientRect, rect2: ClientRect): boolean => {
  return overflowY >= 0 && overflowY <= Math.min(rect1.height, rect2.height) / 2;
};

const isAbove = (rect1: ClientRect, rect2: ClientRect): boolean => {
  if ((rect1.bottom - rect1.height / 2) < rect2.top) {
    return true;
  }

  if (rect1.top > rect2.bottom) {
    return false;
  }

  return isValidOverflow(rect2.top - rect1.bottom, rect1, rect2);
};

const isBelow = (rect1: ClientRect, rect2: ClientRect): boolean => {
  if (rect1.top > rect2.bottom) {
    return true;
  }

  if (rect1.bottom < rect2.top) {
    return false;
  }

  return isValidOverflow(rect2.bottom - rect1.top, rect1, rect2);
};

const isLeft = (rect1: ClientRect, rect2: ClientRect): boolean => rect1.left < rect2.left;
const isRight = (rect1: ClientRect, rect2: ClientRect): boolean => rect1.right > rect2.right;

const compare = (rect1: ClientRect, rect2: ClientRect): number => {
  if (isAbove(rect1, rect2)) {
    return -1;
  }

  if (isBelow(rect1, rect2)) {
    return 1;
  }

  if (isLeft(rect1, rect2)) {
    return -1;
  }

  if (isRight(rect1, rect2)) {
    return 1;
  }

  return 0;
};

const containsXY = (rect: ClientRect, clientX: number, clientY: number): boolean => {
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
};

const overflowX = (outer: ClientRect, inner: ClientRect) => {
  if (inner.left > outer.left && inner.right < outer.right) {
    return 0;
  } else {
    return inner.left < outer.left ? inner.left - outer.left : inner.right - outer.right;
  }
};

const overflowY = (outer: ClientRect, inner: ClientRect) => {
  if (inner.top > outer.top && inner.bottom < outer.bottom) {
    return 0;
  } else {
    return inner.top < outer.top ? inner.top - outer.top : inner.bottom - outer.bottom;
  }
};

const getOverflow = (outer: ClientRect, inner: ClientRect) => {
  return { x: overflowX(outer, inner), y: overflowY(outer, inner) };
};

export {
  clone,
  collapse,
  isEqual,
  isAbove,
  isBelow,
  isLeft,
  isRight,
  compare,
  containsXY,
  getOverflow
};