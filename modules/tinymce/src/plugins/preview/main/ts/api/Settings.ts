/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
import Editor from 'tinymce/core/api/Editor';

const getPreviewDialogWidth = function (editor: Editor) {
  return parseInt(editor.getParam('plugin_preview_width', '650'), 10);
};

const getPreviewDialogHeight = function (editor: Editor) {
  return parseInt(editor.getParam('plugin_preview_height', '500'), 10);
};

const getContentStyle = function (editor: Editor) {
  return editor.getParam('content_style', '');
};

const shouldUseContentCssCors = (editor: Editor): boolean => {
  return editor.getParam('content_css_cors', false, 'boolean');
};

export default {
  getPreviewDialogWidth,
  getPreviewDialogHeight,
  getContentStyle,
  shouldUseContentCssCors
};
