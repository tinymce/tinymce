/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const shouldIndentOnTab = function (editor) {
  return editor.getParam('lists_indent_on_tab', true);
};

export default {
  shouldIndentOnTab
};