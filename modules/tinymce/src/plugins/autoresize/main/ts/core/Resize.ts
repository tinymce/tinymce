/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element } from '@ephox/dom-globals';
import { Cell } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Delay from 'tinymce/core/api/util/Delay';
import * as Events from '../api/Events';
import * as Settings from '../api/Settings';

/**
 * This class contains all core logic for the autoresize plugin.
 *
 * @class tinymce.autoresize.Plugin
 * @private
 */

const isFullscreen = (editor: Editor) => editor.plugins.fullscreen && editor.plugins.fullscreen.isFullscreen();

/**
 * Calls the resize x times in 100ms intervals. We can't wait for load events since
 * the CSS files might load async.
 */
const wait = (editor: Editor, oldSize: Cell<number>, times: number, interval: number, callback?: Function) => {
  Delay.setEditorTimeout(editor, () => {
    resize(editor, oldSize);

    if (times--) {
      wait(editor, oldSize, times, interval, callback);
    } else if (callback) {
      callback();
    }
  }, interval);
};

const toggleScrolling = (editor: Editor, state: boolean) => {
  const body = editor.getBody();
  if (body) {
    body.style.overflowY = state ? '' : 'hidden';
    if (!state) {
      body.scrollTop = 0;
    }
  }
};

const parseCssValueToInt = (dom: DOMUtils, elm: Element, name: string, computed: boolean): number => {
  const value = parseInt(dom.getStyle(elm, name, computed), 10);
  // The value maybe be an empty string, so in that case treat it as being 0
  return isNaN(value) ? 0 : value;
};

/**
 * This method gets executed each time the editor needs to resize.
 */
const resize = (editor: Editor, oldSize: Cell<number>) => {
  const dom = editor.dom;

  const doc = editor.getDoc();
  if (!doc) {
    return;
  }

  if (isFullscreen(editor)) {
    toggleScrolling(editor, true);
    return;
  }

  const docEle = doc.documentElement;
  const resizeBottomMargin = Settings.getAutoResizeBottomMargin(editor);
  let resizeHeight = Settings.getAutoResizeMinHeight(editor);

  // Calculate outer height of the doc element using CSS styles
  const marginTop = parseCssValueToInt(dom, docEle, 'margin-top', true);
  const marginBottom = parseCssValueToInt(dom, docEle, 'margin-bottom', true);
  let contentHeight = docEle.offsetHeight + marginTop + marginBottom + resizeBottomMargin;

  // Make sure we have a valid height
  // Note: Previously we had to do some fallbacks here for IE/Webkit, as the height calculation above didn't work.
  //       However using the latest supported browsers (IE 11 & Safari 11), the fallbacks were no longer needed and were removed.
  if (contentHeight < 0) {
    contentHeight = 0;
  }

  // Determine the size of the chroming (menubar, toolbar, etc...)
  const containerHeight = editor.getContainer().offsetHeight;
  const contentAreaHeight = editor.getContentAreaContainer().offsetHeight;
  const chromeHeight = containerHeight - contentAreaHeight;

  // Don't make it smaller than the minimum height
  if (contentHeight + chromeHeight > Settings.getAutoResizeMinHeight(editor)) {
    resizeHeight = contentHeight + chromeHeight;
  }

  // If a maximum height has been defined don't exceed this height
  const maxHeight = Settings.getAutoResizeMaxHeight(editor);
  if (maxHeight && resizeHeight > maxHeight) {
    resizeHeight = maxHeight;
    toggleScrolling(editor, true);
  } else {
    toggleScrolling(editor, false);
  }

  // Resize content element
  if (resizeHeight !== oldSize.get()) {
    const deltaSize = resizeHeight - oldSize.get();
    dom.setStyle(editor.getContainer(), 'height', resizeHeight + 'px');
    oldSize.set(resizeHeight);
    Events.fireResizeEditor(editor);

    // iPadOS has an issue where it won't rerender the body when the iframe is resized
    // however if we reset the scroll position then it re-renders correctly
    if (Env.browser.isSafari() && Env.mac) {
      const win = editor.getWin();
      win.scrollTo(win.pageXOffset, win.pageYOffset);
    }

    // Ensure the selected node is in view, as it's potentially out of view after resizing the editor
    if (editor.hasFocus()) {
      editor.selection.scrollIntoView(editor.selection.getNode());
    }

    // WebKit doesn't decrease the size of the body element until the iframe gets resized
    // So we need to continue to resize the iframe down until the size gets fixed
    if (Env.webkit && deltaSize < 0) {
      resize(editor, oldSize);
    }
  }
};

const setup = (editor: Editor, oldSize: Cell<number>) => {
  editor.on('init', () => {
    const overflowPadding = Settings.getAutoResizeOverflowPadding(editor);
    const dom = editor.dom;

    // Disable height 100% on the root document element otherwise we'll end up resizing indefinitely
    dom.setStyles(editor.getDoc().documentElement, {
      height: 'auto'
    });

    dom.setStyles(editor.getBody(), {
      'paddingLeft': overflowPadding,
      'paddingRight': overflowPadding,
      // IE & Edge have a min height of 150px by default on the body, so override that
      'min-height': 0
    });
  });

  editor.on('NodeChange SetContent keyup FullscreenStateChanged ResizeContent', () => {
    resize(editor, oldSize);
  });

  if (Settings.shouldAutoResizeOnInit(editor)) {
    editor.on('init', () => {
      // Hit it 20 times in 100 ms intervals
      wait(editor, oldSize, 20, 100, () => {
        // Hit it 5 times in 1 sec intervals
        wait(editor, oldSize, 5, 1000);
      });
    });
  }
};

export {
  setup,
  resize
};
