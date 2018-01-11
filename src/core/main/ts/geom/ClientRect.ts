/**
 * ClientRect.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Utility functions for working with client rects.
 *
 * @private
 * @class tinymce.geom.ClientRect
 */

const round = Math.round;

const clone = function (rect) {
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

const collapse = function (clientRect, toStart) {
  clientRect = clone(clientRect);

  if (toStart) {
    clientRect.right = clientRect.left;
  } else {
    clientRect.left = clientRect.left + clientRect.width;
    clientRect.right = clientRect.left;
  }

  clientRect.width = 0;

  return clientRect;
};

const isEqual = function (rect1, rect2) {
  return (
    rect1.left === rect2.left &&
    rect1.top === rect2.top &&
    rect1.bottom === rect2.bottom &&
    rect1.right === rect2.right
  );
};

const isValidOverflow = function (overflowY, clientRect1, clientRect2) {
  return overflowY >= 0 && overflowY <= Math.min(clientRect1.height, clientRect2.height) / 2;

};

const isAbove = function (clientRect1, clientRect2) {
  if ((clientRect1.bottom - clientRect1.height / 2) < clientRect2.top) {
    return true;
  }

  if (clientRect1.top > clientRect2.bottom) {
    return false;
  }

  return isValidOverflow(clientRect2.top - clientRect1.bottom, clientRect1, clientRect2);
};

const isBelow = function (clientRect1, clientRect2) {
  if (clientRect1.top > clientRect2.bottom) {
    return true;
  }

  if (clientRect1.bottom < clientRect2.top) {
    return false;
  }

  return isValidOverflow(clientRect2.bottom - clientRect1.top, clientRect1, clientRect2);
};

const isLeft = function (clientRect1, clientRect2) {
  return clientRect1.left < clientRect2.left;
};

const isRight = function (clientRect1, clientRect2) {
  return clientRect1.right > clientRect2.right;
};

const compare = function (clientRect1, clientRect2) {
  if (isAbove(clientRect1, clientRect2)) {
    return -1;
  }

  if (isBelow(clientRect1, clientRect2)) {
    return 1;
  }

  if (isLeft(clientRect1, clientRect2)) {
    return -1;
  }

  if (isRight(clientRect1, clientRect2)) {
    return 1;
  }

  return 0;
};

const containsXY = function (clientRect, clientX, clientY) {
  return (
    clientX >= clientRect.left &&
    clientX <= clientRect.right &&
    clientY >= clientRect.top &&
    clientY <= clientRect.bottom
  );
};

export default {
  clone,
  collapse,
  isEqual,
  isAbove,
  isBelow,
  isLeft,
  isRight,
  compare,
  containsXY
};