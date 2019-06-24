/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document, window } from '@ephox/dom-globals';
import { Fun, Singleton } from '@ephox/katamari';
import { Css, Element } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Events from '../api/Events';
import { PlatformDetection } from '@ephox/sand';

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

// Experimental support for visual viewport
type VisualViewport = {
  offsetLeft: number,
  offsetTop: number,
  pageLeft: number,
  pageTop: number,
  width: number,
  height: number,
  scale: number,
  addEventListener: (event: string, handler: () => void) => void,
  removeEventListener: (event: string, handler: () => void) => void
};
/* tslint:disable-next-line:no-string-literal */
const visualViewport: VisualViewport = window['visualViewport'];

// Experiment is for ipadOS 13 only at this stage. Chrome supports this on desktop, and ipadOS cannot be UA detected, so restrict to Safari.
const isSafari = PlatformDetection.detect().browser.isSafari();

const viewportUpdate = !isSafari || visualViewport === undefined ? { bind: Fun.noop, unbind: Fun.noop } : (() => {
  const editorContainer = Singleton.value<Element>();

  const update = () => {
    window.requestAnimationFrame(() => {
      editorContainer.on((container) => Css.setAll(container, {
        top: visualViewport.offsetTop + 'px',
        left: visualViewport.offsetLeft + 'px',
        height: visualViewport.height + 'px',
        width: visualViewport.width + 'px'
      }));
    });
  };

  const bind = (element) => {
    editorContainer.set(element);
    update();
    visualViewport.addEventListener('resize', update);
    visualViewport.addEventListener('scroll', update);
  };

  const unbind = () => {
    editorContainer.on(() => {
      visualViewport.removeEventListener('scroll', update);
      visualViewport.removeEventListener('resize', update);
    });
    editorContainer.clear();
  };

  return {
    bind,
    unbind
  };
})();

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

    viewportUpdate.bind(Element.fromDom(editorContainer));
    editor.on('remove', viewportUpdate.unbind);
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
    viewportUpdate.unbind();
    editor.off('remove', viewportUpdate.unbind);
  }
};

export default {
  toggleFullscreen
};