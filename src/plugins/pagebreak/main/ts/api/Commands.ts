/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import FilterContent from '../core/FilterContent';

const register = function (editor) {
  editor.addCommand('mcePageBreak', function () {
    if (editor.settings.pagebreak_split_block) {
      editor.insertContent('<p>' + FilterContent.getPlaceholderHtml() + '</p>');
    } else {
      editor.insertContent(FilterContent.getPlaceholderHtml());
    }
  });
};

export default {
  register
};