/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Throttler } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import * as SelectionBookmark from './SelectionBookmark';

const isManualNodeChange = (e) => {
  return e.type === 'nodechange' && e.selectionChange;
};

const registerPageMouseUp = (editor: Editor, throttledStore) => {
  const mouseUpPage = () => {
    throttledStore.throttle();
  };

  DOMUtils.DOM.bind(document, 'mouseup', mouseUpPage);

  editor.on('remove', () => {
    DOMUtils.DOM.unbind(document, 'mouseup', mouseUpPage);
  });
};

const registerFocusOut = (editor: Editor) => {
  editor.on('focusout', () => {
    SelectionBookmark.store(editor);
  });
};

const registerMouseUp = (editor: Editor, throttledStore) => {
  editor.on('mouseup touchend', (_e) => {
    throttledStore.throttle();
  });
};

const registerEditorEvents = (editor: Editor, throttledStore) => {
  const browser = PlatformDetection.detect().browser;

  if (browser.isIE()) {
    registerFocusOut(editor);
  } else {
    registerMouseUp(editor, throttledStore);
  }

  editor.on('keyup NodeChange', (e) => {
    if (!isManualNodeChange(e)) {
      SelectionBookmark.store(editor);
    }
  });
};

const register = (editor: Editor) => {
  const throttledStore = Throttler.first(() => {
    SelectionBookmark.store(editor);
  }, 0);

  editor.on('init', () => {
    if (editor.inline) {
      registerPageMouseUp(editor, throttledStore);
    }

    registerEditorEvents(editor, throttledStore);
  });

  editor.on('remove', () => {
    throttledStore.cancel();
  });
};

export {
  register
};
