/**
 * Keyboard.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Actions from './Actions';

const setup = function (editor) {
  editor.addShortcut('Meta+K', '', Actions.openDialog(editor));
};

export default {
  setup
};