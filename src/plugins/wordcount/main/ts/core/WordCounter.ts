/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Delay from 'tinymce/core/api/util/Delay';
import * as WordCount from '../text/WordCount';
import * as Events from '../api/Events';
import Editor from 'tinymce/core/api/Editor';

const updateCount = (editor: Editor) => {
  const wordCount = WordCount.getEditorWordcount(editor);
  Events.fireWordCountUpdate(editor, wordCount);
};

const setup = (editor: Editor) => {
  const debouncedUpdate = Delay.debounce(() => updateCount(editor), 300);

  editor.on('init', () => {
    updateCount(editor);
    Delay.setEditorTimeout(editor, () => {
      editor.on('SetContent BeforeAddUndo Undo Redo keyup', debouncedUpdate);
    }, 0);
  });
};

export {
  setup,
  updateCount
};