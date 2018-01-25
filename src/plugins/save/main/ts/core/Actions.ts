/**
 * Actions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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