/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const getPreviewDialogWidth = function (editor) {
  return parseInt(editor.getParam('plugin_preview_width', '650'), 10);
};

const getPreviewDialogHeight = function (editor) {
  return parseInt(editor.getParam('plugin_preview_height', '500'), 10);
};

const getContentStyle = function (editor) {
  return editor.getParam('content_style', '');
};

export default {
  getPreviewDialogWidth,
  getPreviewDialogHeight,
  getContentStyle
};