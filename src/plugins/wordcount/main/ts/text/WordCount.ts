/**
 * WordCount.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import WordGetter from './WordGetter';

const getTextContent = function (editor) {
  return editor.removed ? '' : editor.getBody().innerText;
};

const getCount = function (editor) {
  return WordGetter.getWords(getTextContent(editor)).length;
};

export default {
  getCount
};