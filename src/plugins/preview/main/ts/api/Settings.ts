/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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