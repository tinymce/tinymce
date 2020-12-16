/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional, Throttler } from '@ephox/katamari';
import { Css, DomEvent, Focus, SugarBody, SugarElement } from '@ephox/sugar';

import * as Orientation from '../../touch/view/Orientation';
import * as CaptureBin from '../../util/CaptureBin';
import * as Rectangles from '../../util/Rectangles';
import FakeSelection from '../focus/FakeSelection';
import * as IosScrolling from '../scroll/IosScrolling';
import BackgroundActivity from '../smooth/BackgroundActivity';
import * as Greenzone from '../view/Greenzone';
import { IosKeyboardConstructor } from '../view/IosKeyboard';
import * as IosUpdates from '../view/IosUpdates';
import * as IosViewport from '../view/IosViewport';

const VIEW_MARGIN = 5;

const register = (toolstrip, socket, container, outerWindow, structure, cWin) => {
  const scroller = BackgroundActivity((y) => {
    return IosScrolling.moveWindowScroll(toolstrip, socket, y);
  });

  // NOTE: This is a WebView specific way of scrolling when out of bounds. When we need to make
  // the webapp work again, we'll have to adjust this function. Essentially, it just jumps the scroll
  // back to show the current selection rectangle.
  const scrollBounds = () => {
    const rects = Rectangles.getRectangles(cWin);
    return Optional.from(rects[0]).bind((rect) => {
      const viewTop = rect.top - socket.dom.scrollTop;
      const outside = viewTop > outerWindow.innerHeight + VIEW_MARGIN || viewTop < -VIEW_MARGIN;
      return outside ? Optional.some({
        top: viewTop,
        bottom: viewTop + rect.height
      }) : Optional.none<{top: number; bottom: number}>();
    });
  };

  const scrollThrottle = Throttler.last(() => {
    /*
     * As soon as the window is back to 0 (idle), scroll the toolbar and socket back into place on scroll.
     */
    scroller.idle(() => {
      IosUpdates.updatePositions(container, outerWindow.pageYOffset).get((/* _ */) => {
        const extraScroll = scrollBounds();
        extraScroll.each((extra) => {
          // TODO: Smoothly animate this in a way that doesn't conflict with anything else.
          socket.dom.scrollTop = socket.dom.scrollTop + extra.top;
        });
        scroller.start(0);
        structure.refresh();
      });
    });
  }, 1000);

  const onScroll = DomEvent.bind(SugarElement.fromDom(outerWindow), 'scroll', () => {
    if (outerWindow.pageYOffset < 0) {
      return;
    }

    /*
    We've experimented with trying to set the socket scroll (hidden vs. scroll) based on whether the outer body
    has scrolled. When the window starts scrolling, we would lock the socket scroll, and we would
    unlock it when the window stopped scrolling. This would give a nice rubber-band effect at the end
    of the content, but would break the code that tried to position the text in the viewable area
    (more details below). Also, as soon as you flicked to outer scroll, if you started scrolling up again,
    you would drag the whole window down, because you would still be in outerscroll mode. That's hardly
    much of a problem, but it is a minor issue. It also didn't play nicely with keeping the toolbar on the screen.

    The big problem was that this was incompatible with the toolbar and scrolling code. We need a padding inside
    the socket so that the bottom of the content can be scrolled into the viewable greenzone. If it doesn't
    have padding, then unless we move the socket top to some negative value as well, then we can't get
    a scrollTop high enough to get the selection into the viewable greenzone. This is the purpose of the
    padding at the bottom of the iframe. Without it, the scroll consistently jumps back to its
    max scroll value, and you can't keep the last line on screen when the keyboard is up.

    However, if the padding is too large, then the content can be 'effectively' scrolled off the screen
    (the iframe anyway), and the user can get lost about where they are. Our short-term fix is just to
    make the padding at the end the height - the greenzone height so that content should always be
    visible on the screen, even if they've scrolled to the end.
    */

    scrollThrottle.throttle();
  });

  IosUpdates.updatePositions(container, outerWindow.pageYOffset).get(Fun.identity);

  return {
    unbind: onScroll.unbind
  };
};

export interface IosApi {
  toEditing: () => void;
  toReading: () => void;
  onToolbarTouch: (event: any) => void;
  refreshSelection: () => void;
  clearSelection: () => void;
  highlightSelection: () => void;
  scrollIntoView: (top: any, bottom: any) => void;
  updateToolbarPadding: (...x: any[]) => void;
  setViewportOffset: (newYOffset: any) => void;
  syncHeight: () => void;
  refreshStructure: () => void;
  destroy: () => void;
}

interface IosSetupOptions {
  readonly cWin: Window;
  readonly ceBody: SugarElement<Node>;
  readonly socket: SugarElement<HTMLElement>;
  readonly toolstrip: SugarElement<HTMLElement>;
  readonly contentElement: SugarElement<HTMLIFrameElement>;
  readonly keyboardType: IosKeyboardConstructor;
  readonly outerWindow: Window;
  readonly dropup: SugarElement<HTMLElement>;
  readonly outerBody: SugarElement<Node>;
}

const setup = (bag: IosSetupOptions) => {
  const cWin = bag.cWin;
  const ceBody = bag.ceBody;
  const socket = bag.socket;
  const toolstrip = bag.toolstrip;
  const contentElement = bag.contentElement;
  const keyboardType = bag.keyboardType;
  const outerWindow = bag.outerWindow;
  const dropup = bag.dropup;
  const outerBody = bag.outerBody;

  const structure = IosViewport.takeover(socket, ceBody, toolstrip, dropup);
  const keyboardModel = keyboardType(outerBody, cWin, SugarBody.body(), contentElement);

  const toEditing = () => {
    // Consider inlining, though it will make it harder to follow the API
    keyboardModel.toEditing();
    clearSelection();
  };

  const toReading = () => {
    keyboardModel.toReading();
  };

  const onToolbarTouch = (_event) => {
    keyboardModel.onToolbarTouch();
  };

  const onOrientation = Orientation.onChange(outerWindow, {
    onChange: Fun.noop,
    onReady: structure.refresh
  });

  // NOTE: When the window is resizing (probably due to meta tags and viewport definitions), we are not receiving a window resize event.
  // However, it happens shortly after we start Ios mode, so here we just wait for the first window size event that we get. This code
  // is also the same code that is used for the Orientation ready event.
  onOrientation.onAdjustment(() => {
    structure.refresh();
  });

  const onResize = DomEvent.bind(SugarElement.fromDom(outerWindow), 'resize', () => {
    if (structure.isExpanding()) {
      structure.refresh();
    }
  });

  const onScroll = register(toolstrip, socket, outerBody, outerWindow, structure, cWin);

  const unfocusedSelection = FakeSelection(cWin, contentElement);

  const refreshSelection = () => {
    if (unfocusedSelection.isActive()) {
      unfocusedSelection.update();
    }
  };

  const highlightSelection = () => {
    unfocusedSelection.update();
  };

  const clearSelection = () => {
    unfocusedSelection.clear();
  };

  const scrollIntoView = (top, bottom) => {
    Greenzone.scrollIntoView(cWin, socket, dropup, top, bottom);
  };

  const syncHeight = () => {
    Css.set(contentElement, 'height', contentElement.dom.contentWindow.document.body.scrollHeight + 'px');
  };

  const setViewportOffset = (newYOffset) => {
    structure.setViewportOffset(newYOffset);
    IosScrolling.moveOnlyTop(socket, newYOffset).get(Fun.identity);
  };

  const destroy = () => {
    structure.restore();
    onOrientation.destroy();
    onScroll.unbind();
    onResize.unbind();
    keyboardModel.destroy();

    unfocusedSelection.destroy();

    // Try and dismiss the keyboard on close, as they have no input focus.
    CaptureBin.input(SugarBody.body(), Focus.blur);
  };

  return {
    toEditing,
    toReading,
    onToolbarTouch,
    refreshSelection,
    clearSelection,
    highlightSelection,
    scrollIntoView,
    updateToolbarPadding: Fun.noop,
    setViewportOffset,
    syncHeight,
    refreshStructure: structure.refresh,
    destroy
  };
};

export {
  setup
};
