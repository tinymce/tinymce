/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Settings from '../api/Settings';
import Editor from 'tinymce/core/api/Editor';

const stateToggle = function (editor: Editor) {
  return function (api) {
    const handler = () => {
      api.setDisabled(Settings.enableWhenDirty(editor) && !editor.isDirty());
    };

    editor.on('NodeChange dirty', handler);
    return () => editor.off('NodeChange dirty', handler);
  };
};

const register = function (editor: Editor) {
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
    onAction: () => editor.execCommand('mceCancel'),
    onSetup: stateToggle(editor)
  });

  editor.addShortcut('Meta+S', '', 'mceSave');
};

export default {
  register
};