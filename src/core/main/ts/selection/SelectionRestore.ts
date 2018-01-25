/**
 * SelectionRestore.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Throttler } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import DOMUtils from '../api/dom/DOMUtils';
import SelectionBookmark from './SelectionBookmark';

const isManualNodeChange = function (e) {
  return e.type === 'nodechange' && e.selectionChange;
};

const registerPageMouseUp = function (editor, throttledStore) {
  const mouseUpPage = function () {
    throttledStore.throttle();
  };

  DOMUtils.DOM.bind(document, 'mouseup', mouseUpPage);

  editor.on('remove', function () {
    DOMUtils.DOM.unbind(document, 'mouseup', mouseUpPage);
  });
};

const registerFocusOut = function (editor) {
  editor.on('focusout', function () {
    SelectionBookmark.store(editor);
  });
};

const registerMouseUp = function (editor, throttledStore) {
  editor.on('mouseup touchend', function (e) {
    throttledStore.throttle();
  });
};

const registerEditorEvents = function (editor, throttledStore) {
  const browser = PlatformDetection.detect().browser;

  if (browser.isIE() || browser.isEdge()) {
    registerFocusOut(editor);
  } else {
    registerMouseUp(editor, throttledStore);
  }

  editor.on('keyup nodechange', function (e) {
    if (!isManualNodeChange(e)) {
      SelectionBookmark.store(editor);
    }
  });
};

const register = function (editor) {
  const throttledStore = Throttler.first(function () {
    SelectionBookmark.store(editor);
  }, 0);

  if (editor.inline) {
    registerPageMouseUp(editor, throttledStore);
  }

  editor.on('init', function () {
    registerEditorEvents(editor, throttledStore);
  });

  editor.on('remove', function () {
    throttledStore.cancel();
  });
};

export default {
  register
};