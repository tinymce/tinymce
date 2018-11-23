/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import EditorManager from 'tinymce/core/api/EditorManager';
import Tools from 'tinymce/core/api/util/Tools';
import * as Settings from '../api/Settings';
import { window } from '@ephox/dom-globals';

EditorManager._beforeUnloadHandler = () => {
  let msg;

  Tools.each(EditorManager.get(), (editor) => {
    // Store a draft for each editor instance
    if (editor.plugins.autosave) {
      editor.plugins.autosave.storeDraft();
    }

    // Setup a return message if the editor is dirty
    if (!msg && editor.isDirty() && Settings.shouldAskBeforeUnload(editor)) {
      msg = editor.translate('You have unsaved changes are you sure you want to navigate away?');
    }
  });

  return msg;
};

const setup = (editor) => {
  window.onbeforeunload = EditorManager._beforeUnloadHandler;
};

export {
  setup
};