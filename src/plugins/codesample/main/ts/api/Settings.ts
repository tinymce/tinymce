/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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