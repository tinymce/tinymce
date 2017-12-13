/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

var getSeparatorHtml = function (editor) {
  return editor.getParam('pagebreak_separator', '<!-- pagebreak -->');
};

var shouldSplitBlock = function (editor) {
  return editor.getParam('pagebreak_split_block', false);
};

export default <any> {
  getSeparatorHtml: getSeparatorHtml,
  shouldSplitBlock: shouldSplitBlock
};