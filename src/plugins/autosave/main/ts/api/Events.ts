/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const fireRestoreDraft = function (editor) {
  return editor.fire('RestoreDraft');
};

const fireStoreDraft = function (editor) {
  return editor.fire('StoreDraft');
};

const fireRemoveDraft = function (editor) {
  return editor.fire('RemoveDraft');
};

export default {
  fireRestoreDraft,
  fireStoreDraft,
  fireRemoveDraft
};