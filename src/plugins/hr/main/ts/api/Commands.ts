/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const register = function (editor) {
  editor.addCommand('InsertHorizontalRule', function () {
    editor.execCommand('mceInsertContent', false, '<hr />');
  });
};

export default {
  register
};