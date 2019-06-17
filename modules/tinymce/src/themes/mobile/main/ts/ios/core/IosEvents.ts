/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Throttler } from '@ephox/katamari';
import { Compare, DomEvent, Height } from '@ephox/sugar';

import TappingEvent from '../../util/TappingEvent';

const initEvents = function (editorApi, iosApi, toolstrip, socket, dropup) {
  const saveSelectionFirst = function () {
    iosApi.run(function (api) {
      api.highlightSelection();
    });
  };

  const refreshIosSelection = function () {
    iosApi.run(function (api) {
      api.refreshSelection();
    });
  };

  const scrollToY = function (yTop, height) {
    // Because the iframe has no scroll, and the socket is the part that scrolls,
    // anything visible inside the iframe actually has a top value (for bounding
    // rectangle) > socket.scrollTop. The rectangle is with respect to the top of
    // the iframe, which has scrolled up above the socket viewport.
    const y = yTop - socket.dom().scrollTop;
    iosApi.run(function (api) {
      api.scrollIntoView(y, y + height);
    });
  };

  const scrollToElement = function (target) {
    scrollToY(iosApi, socket);
  };

  const scrollToCursor = function () {
    editorApi.getCursorBox().each(function (box) {
      scrollToY(box.top(), box.height());
    });
  };

  const clearSelection = function () {
    // Clear any fake selections visible.
    iosApi.run(function (api) {
      api.clearSelection();
    });
  };

  const clearAndRefresh = function () {
    clearSelection();
    refreshThrottle.throttle();
  };

  const refreshView = function () {
    scrollToCursor();
    iosApi.run(function (api) {
      api.syncHeight();
    });
  };

  const reposition = function () {
    const toolbarHeight = Height.get(toolstrip);
    iosApi.run(function (api) {
      api.setViewportOffset(toolbarHeight);
    });

    refreshIosSelection();
    refreshView();
  };

  const toEditing = function () {
    iosApi.run(function (api) {
      api.toEditing();
    });
  };

  const toReading = function () {
    iosApi.run(function (api) {
      api.toReading();
    });
  };

  const onToolbarTouch = function (event) {
    iosApi.run(function (api) {
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
    editorApi.onScrollToCursor(function (tinyEvent) {
      tinyEvent.preventDefault();
      refreshThrottle.throttle();
    }),

    // Scroll to element
    editorApi.onScrollToElement(function (event) {
      scrollToElement(event.element());
    }),

    // Focus the content and show the keyboard
    editorApi.onToEditing(toEditing),

    // Dismiss keyboard
    editorApi.onToReading(toReading),

    // If the user is touching outside the content, but on the body(?) or html elements, find the nearest selection
    // and focus that.
    DomEvent.bind(editorApi.doc(), 'touchend', function (touchEvent) {
      if (Compare.eq(editorApi.html(), touchEvent.target()) || Compare.eq(editorApi.body(), touchEvent.target())) {
        // IosHacks.setSelectionAtTouch(editorApi, touchEvent);
      }
    }),

    // Listen to the toolstrip growing animation so that we can update the position of the socket once it is done.
    DomEvent.bind(toolstrip, 'transitionend', function (transitionEvent) {
      if (transitionEvent.raw().propertyName === 'height') {
        reposition();
      }
    }),

    // Capture the start of interacting with a toolstrip. It is most likely going to lose the selection, so we save it
    // before that happens
    DomEvent.capture(toolstrip, 'touchstart', function (touchEvent) {
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
    DomEvent.bind(editorApi.body(), 'touchstart', function (evt) {
      clearSelection();
      editorApi.onTouchContent();
      tapping.fireTouchstart(evt);
    }),

    tapping.onTouchmove(),
    tapping.onTouchend(),

    // Stop any "clicks" being processed in the body at alls
    DomEvent.bind(editorApi.body(), 'click', function (event) {
      event.kill();
    }),

    // Close any menus when scrolling the toolstrip
    DomEvent.bind(toolstrip, 'touchmove', function (/* event */) {
      editorApi.onToolbarScrollStart();
    })
  ];

  const destroy = function () {
    Arr.each(listeners, function (l) {
      l.unbind();
    });
  };

  return {
    destroy
  };
};

export default {
  initEvents
};