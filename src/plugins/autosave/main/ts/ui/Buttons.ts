/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import * as Storage from '../core/Storage';
import { Editor } from 'tinymce/core/api/Editor';
import { Cell } from '@ephox/katamari';

const makeSetupHandler = (editor: Editor, started: Cell<boolean>) => (api) => {
  api.setDisabled(!Storage.hasDraft(editor));
  const editorEventCallback = () => api.setDisabled(!Storage.hasDraft(editor));
  editor.on('StoreDraft RestoreDraft RemoveDraft', editorEventCallback);
  return () => editor.off('StoreDraft RestoreDraft RemoveDraft', editorEventCallback);
};

const register = (editor: Editor, started: Cell<boolean>) => {
  // TODO: This was moved from makeSetupHandler as it would only be called when the menu item was rendered?
  //       Is it safe to start this process when the plugin is registered?
  Storage.startStoreDraft(editor, started);

  editor.ui.registry.addButton('restoredraft', {
    type: 'button',
    tooltip: 'Restore last draft',
    icon: 'restore-draft',
    onAction: () => {
      Storage.restoreLastDraft(editor);
    },
    onSetup: makeSetupHandler(editor, started)
  });

  editor.ui.registry.addMenuItem('restoredraft', {
    type: 'menuitem',
    text: 'Restore last draft',
    icon: 'restore-draft',
    onAction: () => {
      Storage.restoreLastDraft(editor);
    },
    onSetup: makeSetupHandler(editor, started),
  });
};

export {
  register
};