/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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