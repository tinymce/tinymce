/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Delay from 'tinymce/core/api/util/Delay';
import * as Events from '../api/Events';
import Editor from 'tinymce/core/api/Editor';
import { WordCountApi } from '../api/Api';

const updateCount = (editor: Editor, api: WordCountApi) => {
  Events.fireWordCountUpdate(editor, api);
};

const setup = (editor: Editor, api: WordCountApi) => {
  const debouncedUpdate = Delay.debounce(() => updateCount(editor, api), 300);

  editor.on('init', () => {
    updateCount(editor, api);
    Delay.setEditorTimeout(editor, () => {
      editor.on('SetContent BeforeAddUndo Undo Redo keyup', debouncedUpdate);
    }, 0);
  });
};

export {
  setup,
  updateCount
};