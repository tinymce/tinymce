/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Settings from '../api/Settings';

const stateToggle = function (editor) {
  return function (e) {
    const ctrl = e.control;

    editor.on('nodeChange dirty', function () {
      ctrl.disabled(Settings.enableWhenDirty(editor) && !editor.isDirty());
    });
  };
};

const register = function (editor) {
  editor.addButton('save', {
    icon: 'save',
    text: 'Save',
    cmd: 'mceSave',
    disabled: true,
    onPostRender: stateToggle(editor)
  });

  editor.addButton('cancel', {
    text: 'Cancel',
    icon: false,
    cmd: 'mceCancel',
    disabled: true,
    onPostRender: stateToggle(editor)
  });

  editor.addShortcut('Meta+S', '', 'mceSave');
};

export default {
  register
};