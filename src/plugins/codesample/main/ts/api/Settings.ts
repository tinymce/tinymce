/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

const getContentCss = function (editor) {
  return editor.settings.codesample_content_css;
};

const getLanguages = function (editor) {
  return editor.settings.codesample_languages;
};

const getDialogMinWidth = function (editor) {
  return Math.min(DOMUtils.DOM.getViewPort().w, editor.getParam('codesample_dialog_width', 800));
};

const getDialogMinHeight = function (editor) {
  return Math.min(DOMUtils.DOM.getViewPort().w, editor.getParam('codesample_dialog_height', 650));
};

export default {
  getContentCss,
  getLanguages,
  getDialogMinWidth,
  getDialogMinHeight
};