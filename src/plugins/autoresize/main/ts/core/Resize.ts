/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Env from 'tinymce/core/api/Env';
import Delay from 'tinymce/core/api/util/Delay';
import Settings from '../api/Settings';

/**
 * This class contains all core logic for the autoresize plugin.
 *
 * @class tinymce.autoresize.Plugin
 * @private
 */

const isFullscreen = function (editor) {
  return editor.plugins.fullscreen && editor.plugins.fullscreen.isFullscreen();
};

/**
 * Calls the resize x times in 100ms intervals. We can't wait for load events since
 * the CSS files might load async.
 */
const wait = function (editor, oldSize, times, interval, callback?) {
  Delay.setEditorTimeout(editor, function () {
    resize(editor, oldSize);

    if (times--) {
      wait(editor, oldSize, times, interval, callback);
    } else if (callback) {
      callback();
    }
  }, interval);
};

const toggleScrolling = function (editor, state) {
  const body = editor.getBody();
  if (body) {
    body.style.overflowY = state ? '' : 'hidden';
    if (!state) {
      body.scrollTop = 0;
    }
  }
};

/**
 * This method gets executed each time the editor needs to resize.
 */
const resize = function (editor, oldSize) {
  let deltaSize, doc, body, resizeHeight, myHeight;
  let marginTop, marginBottom, paddingTop, paddingBottom, borderTop, borderBottom;
  const dom = editor.dom;

  doc = editor.getDoc();
  if (!doc) {
    return;
  }

  if (isFullscreen(editor)) {
    toggleScrolling(editor, true);
    return;
  }

  body = doc.body;
  resizeHeight = Settings.getAutoResizeMinHeight(editor);

  // Calculate outer height of the body element using CSS styles
  marginTop = dom.getStyle(body, 'margin-top', true);
  marginBottom = dom.getStyle(body, 'margin-bottom', true);
  paddingTop = dom.getStyle(body, 'padding-top', true);
  paddingBottom = dom.getStyle(body, 'padding-bottom', true);
  borderTop = dom.getStyle(body, 'border-top-width', true);
  borderBottom = dom.getStyle(body, 'border-bottom-width', true);
  myHeight = body.offsetHeight + parseInt(marginTop, 10) + parseInt(marginBottom, 10) +
    parseInt(paddingTop, 10) + parseInt(paddingBottom, 10) +
    parseInt(borderTop, 10) + parseInt(borderBottom, 10);

  // Make sure we have a valid height
  if (isNaN(myHeight) || myHeight <= 0) {
    // Get height differently depending on the browser used
    // eslint-disable-next-line no-nested-ternary
    myHeight = Env.ie ? body.scrollHeight : (Env.webkit && body.clientHeight === 0 ? 0 : body.offsetHeight);
  }

  // Don't make it smaller than the minimum height
  if (myHeight > Settings.getAutoResizeMinHeight(editor)) {
    resizeHeight = myHeight;
  }

  // If a maximum height has been defined don't exceed this height
  const maxHeight = Settings.getAutoResizeMaxHeight(editor);
  if (maxHeight && myHeight > maxHeight) {
    resizeHeight = maxHeight;
    toggleScrolling(editor, true);
  } else {
    toggleScrolling(editor, false);
  }

  // Resize content element
  if (resizeHeight !== oldSize.get()) {
    deltaSize = resizeHeight - oldSize.get();
    dom.setStyle(editor.iframeElement, 'height', resizeHeight + 'px');
    oldSize.set(resizeHeight);

    // WebKit doesn't decrease the size of the body element until the iframe gets resized
    // So we need to continue to resize the iframe down until the size gets fixed
    if (Env.webkit && deltaSize < 0) {
      resize(editor, oldSize);
    }
  }
};

const setup = function (editor, oldSize) {
  editor.on('init', function () {
    let overflowPadding, bottomMargin;
    const dom = editor.dom;

    overflowPadding = Settings.getAutoResizeOverflowPadding(editor);
    bottomMargin = Settings.getAutoResizeBottomMargin(editor);

    if (overflowPadding !== false) {
      dom.setStyles(editor.getBody(), {
        paddingLeft: overflowPadding,
        paddingRight: overflowPadding
      });
    }

    if (bottomMargin !== false) {
      dom.setStyles(editor.getBody(), {
        paddingBottom: bottomMargin
      });
    }
  });

  editor.on('nodechange setcontent keyup FullscreenStateChanged', function (e) {
    resize(editor, oldSize);
  });

  if (Settings.shouldAutoResizeOnInit(editor)) {
    editor.on('init', function () {
      // Hit it 20 times in 100 ms intervals
      wait(editor, oldSize, 20, 100, function () {
        // Hit it 5 times in 1 sec intervals
        wait(editor, oldSize, 5, 1000);
      });
    });
  }
};

export default {
  setup,
  resize
};