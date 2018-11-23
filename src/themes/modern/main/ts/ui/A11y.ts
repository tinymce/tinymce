/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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