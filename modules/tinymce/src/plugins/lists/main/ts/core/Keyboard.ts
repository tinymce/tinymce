/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';

import { indentListSelection, outdentListSelection } from '../actions/Indendation';
import * as Settings from '../api/Settings';
import * as Delete from './Delete';

const setupTabKey = (editor: Editor): void => {
  editor.on('keydown', (e) => {
    // Check for tab but not ctrl/cmd+tab since it switches browser tabs
    if (e.keyCode !== VK.TAB || VK.metaKeyPressed(e)) {
      return;
    }

    editor.undoManager.transact(() => {
      if (e.shiftKey ? outdentListSelection(editor) : indentListSelection(editor)) {
        e.preventDefault();
      }
    });
  });
};

const setup = (editor: Editor): void => {
  if (Settings.shouldIndentOnTab(editor)) {
    setupTabKey(editor);
  }

  Delete.setup(editor);
};

export {
  setup
};
