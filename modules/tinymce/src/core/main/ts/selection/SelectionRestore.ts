/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document } from '@ephox/dom-globals';
import { Throttler } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import DOMUtils from '../api/dom/DOMUtils';
import SelectionBookmark from './SelectionBookmark';
import Editor from '../api/Editor';

const isManualNodeChange = function (e) {
  return e.type === 'nodechange' && e.selectionChange;
};

const registerPageMouseUp = function (editor: Editor, throttledStore) {
  const mouseUpPage = function () {
    throttledStore.throttle();
  };

  DOMUtils.DOM.bind(document, 'mouseup', mouseUpPage);

  editor.on('remove', function () {
    DOMUtils.DOM.unbind(document, 'mouseup', mouseUpPage);
  });
};

const registerFocusOut = function (editor: Editor) {
  editor.on('focusout', function () {
    SelectionBookmark.store(editor);
  });
};

const registerMouseUp = function (editor: Editor, throttledStore) {
  editor.on('mouseup touchend', function (e) {
    throttledStore.throttle();
  });
};

const registerEditorEvents = function (editor: Editor, throttledStore) {
  const browser = PlatformDetection.detect().browser;

  if (browser.isIE()) {
    registerFocusOut(editor);
  } else {
    registerMouseUp(editor, throttledStore);
  }

  editor.on('keyup NodeChange', function (e) {
    if (!isManualNodeChange(e)) {
      SelectionBookmark.store(editor);
    }
  });
};

const register = function (editor: Editor) {
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