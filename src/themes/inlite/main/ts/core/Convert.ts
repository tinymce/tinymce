/**
 * Convert.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { GeomRect } from 'tinymce/core/api/geom/Rect';
import { ClientRect } from '@ephox/dom-globals';

const fromClientRect = function (clientRect: Partial<ClientRect>): GeomRect {
  return {
    x: clientRect.left,
    y: clientRect.top,
    w: clientRect.width,
    h: clientRect.height
  };
};

const toClientRect = function (geomRect: GeomRect): ClientRect {
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