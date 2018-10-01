/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { open } from '../ui/Dialog';

const register = function (editor) {
  editor.addCommand('mcePreview', function () {
    open(editor);
  });
};

export default {
  register
};