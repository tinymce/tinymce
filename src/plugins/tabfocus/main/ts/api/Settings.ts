/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

var getTabFocusElements = function (editor) {
  return editor.getParam('tabfocus_elements', ':prev,:next');
};

var getTabFocus = function (editor) {
  return editor.getParam('tab_focus', getTabFocusElements(editor));
};

export default {
  getTabFocus: getTabFocus
};