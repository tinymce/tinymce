/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const enableWhenDirty = function (editor) {
  return editor.getParam('save_enablewhendirty', true);
};

const hasOnSaveCallback = function (editor) {
  return !!editor.getParam('save_onsavecallback');
};

const hasOnCancelCallback = function (editor) {
  return !!editor.getParam('save_oncancelcallback');
};

export default {
  enableWhenDirty,
  hasOnSaveCallback,
  hasOnCancelCallback
};