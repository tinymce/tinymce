/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLFormElement } from '@ephox/dom-globals';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Tools from 'tinymce/core/api/util/Tools';
import * as Settings from '../api/Settings';

const displayErrorMessage = function (editor, message) {
  editor.notificationManager.open({
    text: message,
    type: 'error'
  });
};

const save = function (editor) {
  const formObj = DOMUtils.DOM.getParent(editor.id, 'form') as HTMLFormElement;

  if (Settings.enableWhenDirty(editor) && !editor.isDirty()) {
    return;
  }

  editor.save();

  // Use callback instead
  if (Settings.hasOnSaveCallback(editor)) {
    editor.execCallback('save_onsavecallback', editor);
    editor.nodeChanged();
    return;
  }

  if (formObj) {
    editor.setDirty(false);

    // TODO: TINY-6105 this is probably broken, as an event should be passed to `onsubmit`
    // so we need to investigate this at some point
    if (!formObj.onsubmit || (formObj as any).onsubmit()) {
      if (typeof formObj.submit === 'function') {
        formObj.submit();
      } else {
        displayErrorMessage(editor, 'Error: Form submit field collision.');
      }
    }

    editor.nodeChanged();
  } else {
    displayErrorMessage(editor, 'Error: No form element found.');
  }
};

const cancel = function (editor) {
  const h = Tools.trim(editor.startContent);

  // Use callback instead
  if (Settings.hasOnCancelCallback(editor)) {
    editor.execCallback('save_oncancelcallback', editor);
    return;
  }

  // Reset the editor content back to the initial state
  editor.resetContent(h);
};

export {
  save,
  cancel
};
