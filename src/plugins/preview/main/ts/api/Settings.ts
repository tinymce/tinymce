/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

var getPreviewDialogWidth = function (editor) {
  return parseInt(editor.getParam('plugin_preview_width', '650'), 10);
};

var getPreviewDialogHeight = function (editor) {
  return parseInt(editor.getParam('plugin_preview_height', '500'), 10);
};

var getContentStyle = function (editor) {
  return editor.getParam('content_style', '');
};

export default {
  getPreviewDialogWidth: getPreviewDialogWidth,
  getPreviewDialogHeight: getPreviewDialogHeight,
  getContentStyle: getContentStyle
};