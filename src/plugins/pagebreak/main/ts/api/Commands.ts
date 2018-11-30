/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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