/**
 * Convert.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const fromClientRect = function (clientRect) {
  return {
    x: clientRect.left,
    y: clientRect.top,
    w: clientRect.width,
    h: clientRect.height
  };
};

const toClientRect = function (geomRect) {
  return {
    left: geomRect.x,
    top: geomRect.y,
    width: geomRect.w,
    height: geomRect.h,
    right: geomRect.x + geomRect.w,
    bottom: geomRect.y + geomRect.h
  };
};

export default {
  fromClientRect,
  toClientRect
};