/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { TransitionEvent } from '@ephox/dom-globals';
import { Arr, Throttler } from '@ephox/katamari';
import { Compare, DomEvent, Height } from '@ephox/sugar';

import * as TappingEvent from '../../util/TappingEvent';

const initEvents = (editorApi, iosApi, toolstrip, socket, _dropup): { destroy: () => void } => {
  const saveSelectionFirst = () => {
    iosApi.run((api) => {
      api.highlightSelection();
    });
  };

  const refreshIosSelection = () => {
    iosApi.run((api) => {
      api.refreshSelection();
    });
  };

  const scrollToY = (yTop: number, height: number): void => {
    // Because the iframe has no scroll, and the socket is the part that scrolls,
    // anything visible inside the iframe actually has a top value (for bounding
    // rectangle) > socket.scrollTop. The rectangle is with respect to the top of
    // the iframe, which has scrolled up above the socket viewport.
    const y = yTop - socket.dom().scrollTop;
    iosApi.run((api) => {
      api.scrollIntoView(y, y + height);
    });
  };

  const scrollToElement = (_target): void => {
    scrollToY(iosApi, socket);
  };

  const scrollToCursor = (): void => {
    editorApi.getCursorBox().each((box) => {
      scrollToY(box.top(), box.height());
    });
  };

  const clearSelection = (): void => {
    // Clear any fake selections visible.
    iosApi.run((api) => {
      api.clearSelection();
    });
  };

  const clearAndRefresh = (): void => {
    clearSelection();
    refreshThrottle.throttle();
  };

  const refreshView = (): void => {
    scrollToCursor();
    iosApi.run((api) => {
      api.syncHeight();
    });
  };

  const reposition = (): void => {
    const toolbarHeight = Height.get(toolstrip);
    iosApi.run((api) => {
      api.setViewportOffset(toolbarHeight);
    });

    refreshIosSelection();
    refreshView();
  };

  const toEditing = (): void => {
    iosApi.run((api) => {
      api.toEditing();
    });
  };

  const toReading = (): void => {
    iosApi.run((api) => {
      api.toReading();
    });
  };

  const onToolbarTouch = (event): void => {
    iosApi.run((api) => {
      api.onToolbarTouch(event);
    });
  };

  const tapping = TappingEvent.monitor(editorApi);

  const refreshThrottle = Throttler.last(refreshView, 300);
  const listeners = [
    // Clear any fake selections, scroll to cursor, and update the iframe height
    editorApi.onKeyup(clearAndRefresh),
    // Update any fake selections that are showing
    editorApi.onNodeChanged(refreshIosSelection),

    // Scroll to cursor, and update the iframe height
    editorApi.onDomChanged(refreshThrottle.throttle),
    // Update any fake selections that are showing
    editorApi.onDomChanged(refreshIosSelection),

    // Scroll to cursor and update the iframe height
    editorApi.onScrollToCursor((tinyEvent) => {
      tinyEvent.preventDefault();
      refreshThrottle.throttle();
    }),

    // Scroll to element
    editorApi.onScrollToElement((event) => {
      scrollToElement(event.element());
    }),

    // Focus the content and show the keyboard
    editorApi.onToEditing(toEditing),

    // Dismiss keyboard
    editorApi.onToReading(toReading),

    // If the user is touching outside the content, but on the body(?) or html elements, find the nearest selection
    // and focus that.
    DomEvent.bind(editorApi.doc(), 'touchend', (touchEvent) => {
      if (Compare.eq(editorApi.html(), touchEvent.target()) || Compare.eq(editorApi.body(), touchEvent.target())) {
        // IosHacks.setSelectionAtTouch(editorApi, touchEvent);
      }
    }),

    // Listen to the toolstrip growing animation so that we can update the position of the socket once it is done.
    DomEvent.bind<TransitionEvent>(toolstrip, 'transitionend', (transitionEvent) => {
      if (transitionEvent.raw().propertyName === 'height') {
        reposition();
      }
    }),

    // Capture the start of interacting with a toolstrip. It is most likely going to lose the selection, so we save it
    // before that happens
    DomEvent.capture(toolstrip, 'touchstart', (touchEvent) => {
      // When touching the toolbar, the first thing that we need to do is 'represent' the selection. We do this with
      // a fake selection. As soon as the focus switches away from the content, the real selection will disappear, so
      // this lets the user still see their selection.

      saveSelectionFirst();

      // Then, depending on the keyboard mode, we may need to do something else (like dismiss the keyboard)
      onToolbarTouch(touchEvent);

      // Fire the touchstart event to the theme for things like hiding dropups
      editorApi.onTouchToolstrip();
    }),

    // When the user clicks back into the content, clear any fake selections
    DomEvent.bind(editorApi.body(), 'touchstart', (evt) => {
      clearSelection();
      editorApi.onTouchContent();
      tapping.fireTouchstart(evt);
    }),

    tapping.onTouchmove(),
    tapping.onTouchend(),

    // Stop any "clicks" being processed in the body at alls
    DomEvent.bind(editorApi.body(), 'click', (event) => {
      event.kill();
    }),

    // Close any menus when scrolling the toolstrip
    DomEvent.bind(toolstrip, 'touchmove', (/* event */) => {
      editorApi.onToolbarScrollStart();
    })
  ];

  const destroy = () => {
    Arr.each(listeners, (l) => {
      l.unbind();
    });
  };

  return {
    destroy
  };
};

export {
  initEvents
};
