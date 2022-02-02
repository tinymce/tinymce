/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';

import * as Settings from '../api/Settings';
import * as Actions from './Actions';

const setup = (editor: Editor): void => {
  const spaces = Settings.getKeyboardSpaces(editor);

  if (spaces > 0) {
    editor.on('keydown', (e) => {
      if (e.keyCode === VK.TAB && !e.isDefaultPrevented()) {
        if (e.shiftKey) {
          return;
        }

        e.preventDefault();
        e.stopImmediatePropagation();
        Actions.insertNbsp(editor, spaces);
      }
    });
  }
};

export {
  setup
};
