/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Tools from 'tinymce/core/api/util/Tools';
import Settings from '../api/Settings';

const displayErrorMessage = function (editor, message) {
  editor.notificationManager.open({
    text: editor.translate(message),
    type: 'error'
  });
};

const save = function (editor) {
  let formObj;

  formObj = DOMUtils.DOM.getParent(editor.id, 'form');

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

    if (!formObj.onsubmit || formObj.onsubmit()) {
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

  editor.setContent(h);
  editor.undoManager.clear();
  editor.nodeChanged();
};

export default {
  save,
  cancel
};