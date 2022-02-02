/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Toolbar } from 'tinymce/core/api/ui/Ui';

import * as Settings from '../api/Settings';

const stateToggle = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi) => {
  const handler = () => {
    api.setDisabled(Settings.enableWhenDirty(editor) && !editor.isDirty());
  };

  handler();
  editor.on('NodeChange dirty', handler);
  return () => editor.off('NodeChange dirty', handler);
};

const register = (editor: Editor): void => {
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

export {
  register
};
