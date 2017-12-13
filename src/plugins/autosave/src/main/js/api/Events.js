/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

var fireRestoreDraft = function (editor) {
  return editor.fire('RestoreDraft');
};

var fireStoreDraft = function (editor) {
  return editor.fire('StoreDraft');
};

var fireRemoveDraft = function (editor) {
  return editor.fire('RemoveDraft');
};

export default <any> {
  fireRestoreDraft: fireRestoreDraft,
  fireStoreDraft: fireStoreDraft,
  fireRemoveDraft: fireRemoveDraft
};