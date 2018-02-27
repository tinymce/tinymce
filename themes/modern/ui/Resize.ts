/**
 * Resize.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Events from '../api/Events';
import * as Settings from '../api/Settings';

const DOM = DOMUtils.DOM;
const getSize = function (elm) {
  return {
    width: elm.clientWidth,
    height: elm.clientHeight
  };
};

const resizeTo = function (editor, width, height) {
  let containerElm, iframeElm, containerSize, iframeSize;

  containerElm = editor.getContainer();
  iframeElm = editor.getContentAreaContainer().firstChild;
  containerSize = getSize(containerElm);
  iframeSize = getSize(iframeElm);

  if (width !== null) {
    width = Math.max(Settings.getMinWidth(editor), width);
    width = Math.min(Settings.getMaxWidth(editor), width);

    DOM.setStyle(containerElm, 'width', width + (containerSize.width - iframeSize.width));
    DOM.setStyle(iframeElm, 'width', width);
  }

  height = Math.max(Settings.getMinHeight(editor), height);
  height = Math.min(Settings.getMaxHeight(editor), height);
  DOM.setStyle(iframeElm, 'height', height);

  Events.fireResizeEditor(editor);
};

const resizeBy = function (editor, dw, dh) {
  const elm = editor.getContentAreaContainer();
  resizeTo(editor, elm.clientWidth + dw, elm.clientHeight + dh);
};

export default {
  resizeTo,
  resizeBy
};