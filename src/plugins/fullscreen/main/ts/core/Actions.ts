/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Events from '../api/Events';
import { window, document } from '@ephox/dom-globals';

const DOM = DOMUtils.DOM;

const getWindowSize = function () {
  let w;
  let h;
  const win = window;
  const doc = document;
  const body = doc.body;

  // Old IE
  if (body.offsetWidth) {
    w = body.offsetWidth;
    h = body.offsetHeight;
  }

  // Modern browsers
  if (win.innerWidth && win.innerHeight) {
    w = win.innerWidth;
    h = win.innerHeight;
  }

  return { w, h };
};

const getScrollPos = function () {
  const vp = DOM.getViewPort();

  return {
    x: vp.x,
    y: vp.y
  };
};

const setScrollPos = function (pos) {
  window.scrollTo(pos.x, pos.y);
};

const toggleFullscreen = function (editor, fullscreenState) {
  const body = document.body;
  const documentElement = document.documentElement;
  let editorContainerStyle;
  let editorContainer, iframe, iframeStyle;
  const fullscreenInfo = fullscreenState.get();

  const resize = function () {
    DOM.setStyle(iframe, 'height', getWindowSize().h - (editorContainer.clientHeight - iframe.clientHeight));
  };

  const removeResize = function () {
    DOM.unbind(window, 'resize', resize);
  };

  editorContainer = editor.getContainer();
  editorContainerStyle = editorContainer.style;
  iframe = editor.getContentAreaContainer().firstChild;
  iframeStyle = iframe.style;

  if (!fullscreenInfo) {
    const newFullScreenInfo = {
      scrollPos: getScrollPos(),
      containerWidth: editorContainerStyle.width,
      containerHeight: editorContainerStyle.height,
      iframeWidth: iframeStyle.width,
      iframeHeight: iframeStyle.height,
      resizeHandler: resize,
      removeHandler: removeResize
    };

    iframeStyle.width = iframeStyle.height = '100%';
    editorContainerStyle.width = editorContainerStyle.height = '';

    DOM.addClass(body, 'mce-fullscreen');
    DOM.addClass(documentElement, 'mce-fullscreen');
    DOM.addClass(editorContainer, 'mce-fullscreen');

    DOM.bind(window, 'resize', resize);
    editor.on('remove', removeResize);

    resize();

    fullscreenState.set(newFullScreenInfo);
    Events.fireFullscreenStateChanged(editor, true);
  } else {
    iframeStyle.width = fullscreenInfo.iframeWidth;
    iframeStyle.height = fullscreenInfo.iframeHeight;

    if (fullscreenInfo.containerWidth) {
      editorContainerStyle.width = fullscreenInfo.containerWidth;
    }

    if (fullscreenInfo.containerHeight) {
      editorContainerStyle.height = fullscreenInfo.containerHeight;
    }

    DOM.removeClass(body, 'mce-fullscreen');
    DOM.removeClass(documentElement, 'mce-fullscreen');
    DOM.removeClass(editorContainer, 'mce-fullscreen');
    setScrollPos(fullscreenInfo.scrollPos);

    DOM.unbind(window, 'resize', fullscreenInfo.resizeHandler);
    editor.off('remove', fullscreenInfo.removeHandler);

    fullscreenState.set(null);
    Events.fireFullscreenStateChanged(editor, false);
  }
};

export default {
  toggleFullscreen
};