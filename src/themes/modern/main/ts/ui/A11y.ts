/**
 * A11y.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const focus = function (panel, type) {
  return function () {
    const item = panel.find(type)[0];

    if (item) {
      item.focus(true);
    }
  };
};

const addKeys = function (editor, panel) {
  editor.shortcuts.add('Alt+F9', '', focus(panel, 'menubar'));
  editor.shortcuts.add('Alt+F10,F10', '', focus(panel, 'toolbar'));
  editor.shortcuts.add('Alt+F11', '', focus(panel, 'elementpath'));
  panel.on('cancel', function () {
    editor.focus();
  });
};

export default {
  addKeys
};