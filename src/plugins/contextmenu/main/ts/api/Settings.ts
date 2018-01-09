/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

var shouldNeverUseNative = function (editor) {
  return editor.settings.contextmenu_never_use_native;
};

var getContextMenu = function (editor) {
  return editor.getParam('contextmenu', 'link openlink image inserttable | cell row column deletetable');
};

export default {
  shouldNeverUseNative: shouldNeverUseNative,
  getContextMenu: getContextMenu
};