/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Direction from '../core/Direction';

const register = function (editor) {
  editor.addCommand('mceDirectionLTR', function () {
    Direction.setDir(editor, 'ltr');
  });

  editor.addCommand('mceDirectionRTL', function () {
    Direction.setDir(editor, 'rtl');
  });
};

export default {
  register
};