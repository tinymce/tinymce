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

const getMinWidth = function (editor) {
  return editor.getParam('code_dialog_width', 600);
};

const getMinHeight = function (editor) {
  return editor.getParam('code_dialog_height', Math.min(DOMUtils.DOM.getViewPort().h - 200, 500));
};

export default {
  getMinWidth,
  getMinHeight
};