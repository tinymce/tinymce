/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document, window } from '@ephox/dom-globals';
import { Fun, Singleton } from '@ephox/katamari';
import { Css, Element, VisualViewport, Body, DomEvent } from '@ephox/sugar';
import Events from '../api/Events';
import { PlatformDetection } from '@ephox/sand';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Delay from 'tinymce/core/api/util/Delay';
import { styleSync, onTouchMove } from './StyleSync';

const DOM = DOMUtils.DOM;

const getScrollPos = function () {
  const vp = VisualViewport.getBounds(window);

  return {
    x: vp.x(),
    y: vp.y()
  };
};

const setScrollPos = function (pos) {
  window.scrollTo(pos.x, pos.y);
};

/* tslint:disable-next-line:no-string-literal */
const visualViewport: VisualViewport.VisualViewport = window['visualViewport'];

// Experiment is for ipadOS 13 only at this stage. Chrome supports this on desktop, and ipadOS cannot be UA detected, so restrict to Safari.
const isSafari = PlatformDetection.detect().browser.isSafari();

const viewportUpdate = !isSafari || visualViewport === undefined ? { bind: Fun.noop, unbind: Fun.noop, update: Fun.noop } : (() => {
  const editorContainer = Singleton.value<Element>();

  const refreshVisualViewport = () => {
    window.requestAnimationFrame(() => {
      Css.setAll(Element.fromDom(window.document.documentElement), {
        top: visualViewport.offsetTop + 'px',
        left: visualViewport.offsetLeft + 'px',
        height: (visualViewport.height + 1) + 'px',
        width: visualViewport.width + 'px'
      });

      Css.setAll(Body.body(), {
        top: visualViewport.offsetTop + 'px',
        left: visualViewport.offsetLeft + 'px',
        height: (visualViewport.height + 1 ) + 'px',
        width: visualViewport.width + 'px'
      });

      editorContainer.on((container) => Css.setAll(container, {
        top: visualViewport.offsetTop + 'px',
        left: visualViewport.offsetLeft + 'px',
        height: visualViewport.height + 'px',
        width: visualViewport.width + 'px'
      }));
    });
    // console.log(a);
  };

  const update = Delay.throttle(refreshVisualViewport, 50);

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
    update,
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
  const isTouch = PlatformDetection.detect().deviceType.isTouch();
  let touchmoveHandler = {
    unbind: Fun.noop
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
      iframeHeight: iframeStyle.height
    };

    if (isTouch) {
      styleSync(editor);
      touchmoveHandler = DomEvent.capture(Element.fromDom(editorContainer), 'touchmove', onTouchMove);
    }

    iframeStyle.width = iframeStyle.height = '100%';
    editorContainerStyle.width = editorContainerStyle.height = '';

    DOM.addClass(body, 'tox-fullscreen');
    DOM.addClass(documentElement, 'tox-fullscreen');
    DOM.addClass(editorContainer, 'tox-fullscreen');

    viewportUpdate.bind(Element.fromDom(editorContainer));
    window.foo = viewportUpdate;

    editor.on('refreshVisualViewport', viewportUpdate.update);

    editor.on('remove', () => {
      editor.off('refreshVisualViewport', viewportUpdate.update);
      viewportUpdate.unbind();
    });
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
    touchmoveHandler.unbind();
  }
};

export default {
  toggleFullscreen
};