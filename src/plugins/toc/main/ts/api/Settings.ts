/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const getTocClass = function (editor) {
  return editor.getParam('toc_class', 'mce-toc');
};

const getTocHeader = function (editor) {
  const tagName = editor.getParam('toc_header', 'h2');
  return /^h[1-6]$/.test(tagName) ? tagName : 'h2';
};

const getTocDepth = function (editor) {
  const depth = parseInt(editor.getParam('toc_depth', '3'), 10);
  return depth >= 1 && depth <= 9 ? depth : 3;
};

export default {
  getTocClass,
  getTocHeader,
  getTocDepth
};