/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const getKeyboardSpaces = function (editor) {
  const spaces = editor.getParam('nonbreaking_force_tab', 0);

  if (typeof spaces === 'boolean') {
    return spaces === true ? 3 : 0;
  } else {
    return spaces;
  }
};

export default {
  getKeyboardSpaces
};