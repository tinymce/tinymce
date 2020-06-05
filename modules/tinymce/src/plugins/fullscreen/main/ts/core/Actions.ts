/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
import { document, window } from '@ephox/dom-globals';
import { Fun, Singleton, Cell } from '@ephox/katamari';
import { Css, Element, VisualViewport } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Env from 'tinymce/core/api/Env';
import Delay from 'tinymce/core/api/util/Delay';
import * as Events from '../api/Events';
import * as Thor from './Thor';
import Editor from 'tinymce/core/api/Editor';

const DOM = DOMUtils.DOM;

const getScrollPos = () => {
  const vp = VisualViewport.getBounds(window);

  return {
    x: vp.x,
    y: vp.y
  };
};

const setScrollPos = (pos) => {
  window.scrollTo(pos.x, pos.y);
};

const viewportUpdate = VisualViewport.get().fold(
  () => ({ bind: Fun.noop, unbind: Fun.noop }),
  (visualViewport) => {
    const editorContainer = Singleton.value<Element>();
    const resizeBinder = Singleton.unbindable();
    const scrollBinder = Singleton.unbindable();

    const refreshScroll = () => {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    const refreshVisualViewport = () => {
      window.requestAnimationFrame(() => {
        editorContainer.on((container) => Css.setAll(container, {
          top: visualViewport.offsetTop + 'px',
          left: visualViewport.offsetLeft + 'px',
          height: visualViewport.height + 'px',
          width: visualViewport.width + 'px'
        }));
      });
    };

    const update = Delay.throttle(() => {
      refreshScroll();
      refreshVisualViewport();
    }, 50);

    const bind = (element) => {
      editorContainer.set(element);
      update();
      resizeBinder.set(VisualViewport.bind('resize', update));
      scrollBinder.set(VisualViewport.bind('scroll', update));
    };

    const unbind = () => {
      editorContainer.on(() => {
        resizeBinder.clear();
        scrollBinder.clear();
      });
      editorContainer.clear();
    };

    return {
      bind,
      unbind
    };
  }
);

const toggleFullscreen = (editor: Editor, fullscreenState: Cell<any>) => {
  const body = document.body;
  const documentElement = document.documentElement;
  const editorContainer = editor.getContainer();
  const editorContainerS = Element.fromDom(editorContainer);

  const fullscreenInfo = fullscreenState.get();
  const editorBody = Element.fromDom(editor.getBody());

  const isTouch = Env.deviceType.isTouch();

  const editorContainerStyle = editorContainer.style;

  const iframe = editor.iframeElement;
  const iframeStyle = iframe.style;

  const cleanup = () => {
    if (isTouch) {
      Thor.restoreStyles(editor.dom);
    }

    DOM.removeClass(body, 'tox-fullscreen');
    DOM.removeClass(documentElement, 'tox-fullscreen');
    DOM.removeClass(editorContainer, 'tox-fullscreen');

    viewportUpdate.unbind();
  };

  if (!fullscreenInfo) {
    const newFullScreenInfo = {
      scrollPos: getScrollPos(),
      containerWidth: editorContainerStyle.width,
      containerHeight: editorContainerStyle.height,
      containerTop: editorContainerStyle.top,
      containerLeft: editorContainerStyle.left,
      iframeWidth: iframeStyle.width,
      iframeHeight: iframeStyle.height
    };

    if (isTouch) {
      Thor.clobberStyles(editor.dom, editorContainerS, editorBody);
    }

    iframeStyle.width = iframeStyle.height = '100%';
    editorContainerStyle.width = editorContainerStyle.height = '';

    DOM.addClass(body, 'tox-fullscreen');
    DOM.addClass(documentElement, 'tox-fullscreen');
    DOM.addClass(editorContainer, 'tox-fullscreen');

    viewportUpdate.bind(editorContainerS);

    editor.on('remove', cleanup);

    fullscreenState.set(newFullScreenInfo);
    Events.fireFullscreenStateChanged(editor, true);
  } else {
    iframeStyle.width = fullscreenInfo.iframeWidth;
    iframeStyle.height = fullscreenInfo.iframeHeight;

    editorContainerStyle.width = fullscreenInfo.containerWidth;
    editorContainerStyle.height = fullscreenInfo.containerHeight;
    editorContainerStyle.top = fullscreenInfo.containerTop;
    editorContainerStyle.left = fullscreenInfo.containerLeft;

    setScrollPos(fullscreenInfo.scrollPos);

    fullscreenState.set(null);
    Events.fireFullscreenStateChanged(editor, false);
    cleanup();
    editor.off('remove', cleanup);
  }
};

export {
  toggleFullscreen
};
