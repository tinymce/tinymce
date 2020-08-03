/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell, Fun, Singleton, Optional } from '@ephox/katamari';
import { Css, SugarElement, WindowVisualViewport, DomEvent, Traverse, EventUnbinder, SugarShadowDom, SugarBody } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Delay from 'tinymce/core/api/util/Delay';
import * as Events from '../api/Events';
import * as Settings from '../api/Settings';
import * as Thor from './Thor';

export interface ScrollInfo {
  scrollPos: {
    x: number;
    y: number;
  };
  containerWidth: string;
  containerHeight: string;
  containerTop: string;
  containerLeft: string;
  iframeWidth: string;
  iframeHeight: string;
  fullscreenChangeHandler: EventUnbinder;
};

const DOM = DOMUtils.DOM;

const getScrollPos = () => {
  const vp = WindowVisualViewport.getBounds(window);

  return {
    x: vp.x,
    y: vp.y
  };
};

const setScrollPos = (pos) => {
  window.scrollTo(pos.x, pos.y);
};

const viewportUpdate = WindowVisualViewport.get().fold(
  () => ({ bind: Fun.noop, unbind: Fun.noop }),
  (visualViewport) => {
    const editorContainer = Singleton.value<SugarElement>();
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
      resizeBinder.set(WindowVisualViewport.bind('resize', update));
      scrollBinder.set(WindowVisualViewport.bind('scroll', update));
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

const getFullscreenRoot = (editor: Editor): SugarElement<Element> => {
  const elem = SugarElement.fromDom(editor.getElement());
  return SugarShadowDom.getShadowRoot(elem).map(SugarShadowDom.getShadowHost).
    getOrThunk(() => SugarBody.getBody(Traverse.owner(elem)));
};

const getFullscreenElement = (root: DocumentOrShadowRoot) => {
  if (root.fullscreenElement !== undefined) {
    return root.fullscreenElement;
  } else if ((root as any).msFullscreenElement !== undefined) {
    return (root as any).msFullscreenElement;
  } else if ((root as any).webkitFullscreenElement !== undefined) {
    return (root as any).webkitFullscreenElement;
  } else {
    return null;
  }
};

const getFullscreenchangeEventName = () => {
  if (document.fullscreenElement !== undefined) {
    return 'fullscreenchange';
  }
  else if ((document as any).msFullscreenElement !== undefined) {
    return 'MSFullscreenChange'; // warning, seems to be case sensitive
  }
  else if ((document as any).webkitFullscreenElement !== undefined) {
    return 'webkitfullscreenchange';
  }
  else {
    return 'fullscreenchange';
  }
};

const requestFullscreen = (elem: Element) => {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if ((elem as any).msRequestFullscreen) {
    (elem as any).msRequestFullscreen();
  } else if ((elem as any).webkitRequestFullScreen) {
    (elem as any).webkitRequestFullScreen();
  }
};

const exitFullscreen = (doc: Document) => {
  if (doc.exitFullscreen) {
    doc.exitFullscreen();
  } else if ((doc as any).msExitFullscreen) {
    (doc as any).msExitFullscreen();
  } else if ((doc as any).webkitCancelFullScreen) {
    (doc as any).webkitCancelFullScreen();
  }
};

const isFullscreenElement = (elem: SugarElement<Element>) =>
  elem.dom === getFullscreenElement(Traverse.owner(elem).dom);

const toggleFullscreen = (editor: Editor, fullscreenState: Cell<ScrollInfo | null>) => {
  const body = document.body;
  const documentElement = document.documentElement;
  const editorContainer = editor.getContainer();
  const editorContainerS = SugarElement.fromDom(editorContainer);
  const fullscreenRoot = getFullscreenRoot(editor);

  const fullscreenInfo: ScrollInfo | null = fullscreenState.get();
  const editorBody = SugarElement.fromDom(editor.getBody());

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
    Optional.from(fullscreenState.get()).each((info) => info.fullscreenChangeHandler.unbind());
  };

  if (!fullscreenInfo) {
    const fullscreenChangeHandler = DomEvent.bind(Traverse.owner(fullscreenRoot), getFullscreenchangeEventName(), (_evt) => {
      if (Settings.getFullscreenNative(editor)) {
        // if we have exited browser fullscreen with Escape then exit editor fullscreen too
        if (!isFullscreenElement(fullscreenRoot) && fullscreenState.get() !== null) {
          toggleFullscreen(editor, fullscreenState);
        }
      }
    });


    const newFullScreenInfo = {
      scrollPos: getScrollPos(),
      containerWidth: editorContainerStyle.width,
      containerHeight: editorContainerStyle.height,
      containerTop: editorContainerStyle.top,
      containerLeft: editorContainerStyle.left,
      iframeWidth: iframeStyle.width,
      iframeHeight: iframeStyle.height,
      fullscreenChangeHandler
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
    if (Settings.getFullscreenNative(editor)) {
      requestFullscreen(fullscreenRoot.dom);
    }
    Events.fireFullscreenStateChanged(editor, true);
  } else {
    fullscreenInfo.fullscreenChangeHandler.unbind();
    if (Settings.getFullscreenNative(editor) && isFullscreenElement(fullscreenRoot)) {
      exitFullscreen(Traverse.owner(fullscreenRoot).dom);
    }
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
