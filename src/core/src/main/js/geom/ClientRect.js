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
define(
  'tinymce.core.geom.ClientRect',
  [
  ],
  function () {
    var round = Math.round;

    function clone(rect) {
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
    }

    function collapse(clientRect, toStart) {
      clientRect = clone(clientRect);

      if (toStart) {
        clientRect.right = clientRect.left;
      } else {
        clientRect.left = clientRect.left + clientRect.width;
        clientRect.right = clientRect.left;
      }

      clientRect.width = 0;

      return clientRect;
    }

    function isEqual(rect1, rect2) {
      return (
        rect1.left === rect2.left &&
        rect1.top === rect2.top &&
        rect1.bottom === rect2.bottom &&
        rect1.right === rect2.right
      );
    }

    function isValidOverflow(overflowY, clientRect1, clientRect2) {
      return overflowY >= 0 && overflowY <= Math.min(clientRect1.height, clientRect2.height) / 2;

    }

    function isAbove(clientRect1, clientRect2) {
      if ((clientRect1.bottom - clientRect1.height / 2) < clientRect2.top) {
        return true;
      }

      if (clientRect1.top > clientRect2.bottom) {
        return false;
      }

      return isValidOverflow(clientRect2.top - clientRect1.bottom, clientRect1, clientRect2);
    }

    function isBelow(clientRect1, clientRect2) {
      if (clientRect1.top > clientRect2.bottom) {
        return true;
      }

      if (clientRect1.bottom < clientRect2.top) {
        return false;
      }

      return isValidOverflow(clientRect2.bottom - clientRect1.top, clientRect1, clientRect2);
    }

    function isLeft(clientRect1, clientRect2) {
      return clientRect1.left < clientRect2.left;
    }

    function isRight(clientRect1, clientRect2) {
      return clientRect1.right > clientRect2.right;
    }

    function compare(clientRect1, clientRect2) {
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
    }

    function containsXY(clientRect, clientX, clientY) {
      return (
        clientX >= clientRect.left &&
        clientX <= clientRect.right &&
        clientY >= clientRect.top &&
        clientY <= clientRect.bottom
      );
    }

    return {
      clone: clone,
      collapse: collapse,
      isEqual: isEqual,
      isAbove: isAbove,
      isBelow: isBelow,
      isLeft: isLeft,
      isRight: isRight,
      compare: compare,
      containsXY: containsXY
    };
  }
);
