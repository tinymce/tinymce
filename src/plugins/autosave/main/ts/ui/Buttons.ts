/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Storage from '../core/Storage';
import Editor from 'tinymce/core/api/Editor';
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
    tooltip: 'Restore last draft',
    icon: 'restore-draft',
    onAction: () => {
      Storage.restoreLastDraft(editor);
    },
    onSetup: makeSetupHandler(editor, started)
  });

  editor.ui.registry.addMenuItem('restoredraft', {
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