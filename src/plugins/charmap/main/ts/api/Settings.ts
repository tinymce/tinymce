/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const getCharMap = function (editor) {
  return editor.settings.charmap;
};

const getCharMapAppend = function (editor) {
  return editor.settings.charmap_append;
};

export default {
  getCharMap,
  getCharMapAppend
};