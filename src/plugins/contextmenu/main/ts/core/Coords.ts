/**
 * Coords.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { getUiContainer } from 'tinymce/plugins/contextmenu/core/UiContainer';

const nu = function (x, y) {
  return { x, y };
};

const transpose = function (pos, dx, dy) {
  return nu(pos.x + dx, pos.y + dy);
};

const fromPageXY = function (e) {
  return nu(e.pageX, e.pageY);
};

const fromClientXY = function (e) {
  return nu(e.clientX, e.clientY);
};

const transposeUiContainer = function (element, pos) {
  if (element && DOMUtils.DOM.getStyle(element, 'position', true) !== 'static') {
    const containerPos = DOMUtils.DOM.getPos(element);
    const dx = containerPos.x - element.scrollLeft;
    const dy = containerPos.y - element.scrollTop;
    return transpose(pos, -dx, -dy);
  } else {
    return transpose(pos, 0, 0);
  }
};

const transposeContentAreaContainer = function (element, pos) {
  const containerPos = DOMUtils.DOM.getPos(element);
  return transpose(pos, containerPos.x, containerPos.y);
};

const getPos = function (editor, e) {
  if (editor.inline) {
    return transposeUiContainer(getUiContainer(editor), fromPageXY(e));
  } else {
    const iframePos = transposeContentAreaContainer(editor.getContentAreaContainer(), fromClientXY(e));
    return transposeUiContainer(getUiContainer(editor), iframePos);
  }
};

export default {
  getPos
};