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
      iframeHeight: iframeStyle.height
    };

    iframeStyle.width = iframeStyle.height = '100%';
    editorContainerStyle.width = editorContainerStyle.height = '';

    DOM.addClass(body, 'tox-fullscreen');
    DOM.addClass(documentElement, 'tox-fullscreen');
    DOM.addClass(editorContainer, 'tox-fullscreen');

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

    DOM.removeClass(body, 'tox-fullscreen');
    DOM.removeClass(documentElement, 'tox-fullscreen');
    DOM.removeClass(editorContainer, 'tox-fullscreen');
    setScrollPos(fullscreenInfo.scrollPos);

    fullscreenState.set(null);
    Events.fireFullscreenStateChanged(editor, false);
  }
};

export default {
  toggleFullscreen
};