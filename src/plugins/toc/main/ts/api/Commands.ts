/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Toc from '../core/Toc';

const register = function (editor) {
  editor.addCommand('mceInsertToc', function () {
    Toc.insertToc(editor);
  });

  editor.addCommand('mceUpdateToc', function () {
    Toc.updateToc(editor);
  });
};

export default {
  register
};