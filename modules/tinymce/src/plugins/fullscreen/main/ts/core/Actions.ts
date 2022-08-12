import { Cell, Fun, Optional, Singleton, Throttler } from '@ephox/katamari';
import { Css, DomEvent, EventUnbinder, SugarElement, SugarShadowDom, Traverse, WindowVisualViewport } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';

import * as Events from '../api/Events';
import * as Options from '../api/Options';
import { exitFullscreen, getFullscreenchangeEventName, getFullscreenRoot, isFullscreenElement, requestFullscreen } from './NativeFullscreen';
import * as Thor from './Thor';

interface ScrollPos {
  readonly x: number;
  readonly y: number;
}

export interface ScrollInfo {
  readonly scrollPos: ScrollPos;
  readonly containerWidth: string;
  readonly containerHeight: string;
  readonly containerTop: string;
  readonly containerLeft: string;
  readonly iframeWidth: string;
  readonly iframeHeight: string;
  readonly fullscreenChangeHandler: EventUnbinder;
}

const DOM = DOMUtils.DOM;

const getScrollPos = (): ScrollPos =>
  WindowVisualViewport.getBounds(window);

const setScrollPos = (pos: ScrollPos): void =>
  window.scrollTo(pos.x, pos.y);

const viewportUpdate = WindowVisualViewport.get().fold(
  () => ({ bind: Fun.noop, unbind: Fun.noop }),
  (visualViewport) => {
    const editorContainer = Singleton.value<SugarElement<HTMLElement>>();
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

    const update = Throttler.first(() => {
      refreshScroll();
      refreshVisualViewport();
    }, 50);

    const bind = (element: SugarElement<HTMLElement>) => {
      editorContainer.set(element);
      update.throttle();
      resizeBinder.set(WindowVisualViewport.bind('resize', update.throttle));
      scrollBinder.set(WindowVisualViewport.bind('scroll', update.throttle));
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

const toggleFullscreen = (editor: Editor, fullscreenState: Cell<ScrollInfo | null>): void => {
  const body = document.body;
  const documentElement = document.documentElement;
  const editorContainer = editor.getContainer();
  const editorContainerS = SugarElement.fromDom(editorContainer);
  const fullscreenRoot = getFullscreenRoot(editor);

  const fullscreenInfo: ScrollInfo | null = fullscreenState.get();
  const editorBody = SugarElement.fromDom(editor.getBody());

  const isTouch = Env.deviceType.isTouch();

  const editorContainerStyle = editorContainer.style;

  const iframe = editor.iframeElement as HTMLIFrameElement;
  const iframeStyle = iframe?.style;

  const handleClasses = (handler: (elm: string | Element | Element[], cls: string) => void) => {
    handler(body, 'tox-fullscreen');
    handler(documentElement, 'tox-fullscreen');
    handler(editorContainer, 'tox-fullscreen');
    SugarShadowDom.getShadowRoot(editorContainerS)
      .map((root) => SugarShadowDom.getShadowHost(root).dom)
      .each((host) => {
        handler(host, 'tox-fullscreen');
        handler(host, 'tox-shadowhost');
      });
  };

  const cleanup = () => {
    if (isTouch) {
      Thor.restoreStyles(editor.dom);
    }

    handleClasses(DOM.removeClass);

    viewportUpdate.unbind();
    Optional.from(fullscreenState.get()).each((info) => info.fullscreenChangeHandler.unbind());
  };

  if (!fullscreenInfo) {
    const fullscreenChangeHandler = DomEvent.bind(Traverse.owner(fullscreenRoot), getFullscreenchangeEventName(), (_evt) => {
      if (Options.getFullscreenNative(editor)) {
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

    handleClasses(DOM.addClass);

    viewportUpdate.bind(editorContainerS);

    editor.on('remove', cleanup);

    fullscreenState.set(newFullScreenInfo);
    if (Options.getFullscreenNative(editor)) {
      requestFullscreen(fullscreenRoot);
    }
    Events.fireFullscreenStateChanged(editor, true);
  } else {
    fullscreenInfo.fullscreenChangeHandler.unbind();
    if (Options.getFullscreenNative(editor) && isFullscreenElement(fullscreenRoot)) {
      exitFullscreen(Traverse.owner(fullscreenRoot));
    }
    iframeStyle.width = fullscreenInfo.iframeWidth;
    iframeStyle.height = fullscreenInfo.iframeHeight;

    editorContainerStyle.width = fullscreenInfo.containerWidth;
    editorContainerStyle.height = fullscreenInfo.containerHeight;
    editorContainerStyle.top = fullscreenInfo.containerTop;
    editorContainerStyle.left = fullscreenInfo.containerLeft;

    cleanup();
    setScrollPos(fullscreenInfo.scrollPos);

    fullscreenState.set(null);
    Events.fireFullscreenStateChanged(editor, false);
    editor.off('remove', cleanup);
  }
};

export {
  toggleFullscreen
};
