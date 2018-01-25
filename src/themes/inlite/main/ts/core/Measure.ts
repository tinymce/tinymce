/**
 * Measure.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Convert from './Convert';

const toAbsolute = function (rect) {
  const vp = DOMUtils.DOM.getViewPort();

  return {
    x: rect.x + vp.x,
    y: rect.y + vp.y,
    w: rect.w,
    h: rect.h
  };
};

const measureElement = function (elm) {
  const clientRect = elm.getBoundingClientRect();

  return toAbsolute({
    x: clientRect.left,
    y: clientRect.top,
    w: Math.max(elm.clientWidth, elm.offsetWidth),
    h: Math.max(elm.clientHeight, elm.offsetHeight)
  });
};

const getElementRect = function (editor, elm) {
  return measureElement(elm);
};

const getPageAreaRect = function (editor) {
  return measureElement(editor.getElement().ownerDocument.body);
};

const getContentAreaRect = function (editor) {
  return measureElement(editor.getContentAreaContainer() || editor.getBody());
};

const getSelectionRect = function (editor) {
  const clientRect = editor.selection.getBoundingClientRect();
  return clientRect ? toAbsolute(Convert.fromClientRect(clientRect)) : null;
};

export default {
  getElementRect,
  getPageAreaRect,
  getContentAreaRect,
  getSelectionRect
};