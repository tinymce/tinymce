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
  return function (api) {
    const handler = () => {
      api.setDisabled(Settings.enableWhenDirty(editor) && !editor.isDirty());
    };

    editor.on('nodeChange dirty', handler);
    return () => editor.off('nodeChange dirty', handler);
  };
};

const register = function (editor) {
  editor.ui.registry.addButton('save', {
    icon: 'save',
    tooltip: 'Save',
    disabled: true,
    onAction: () => editor.execCommand('mceSave'),
    onSetup: stateToggle(editor)
  });

  editor.ui.registry.addButton('cancel', {
    icon: 'cancel',
    tooltip: 'Cancel',
    disabled: true,
    onAction: () => editor.execCommand('mceSave'),
    onSetup: stateToggle(editor)
  });

  editor.addShortcut('Meta+S', '', 'mceSave');
};

export default {
  register
};