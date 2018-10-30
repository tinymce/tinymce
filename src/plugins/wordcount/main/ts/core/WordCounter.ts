/**
 * Wordcounter.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Delay from 'tinymce/core/api/util/Delay';
// import I18n from 'tinymce/core/api/util/I18n';
import * as WordCount from '../text/WordCount';
import * as Events from '../api/Events';
import { Editor } from 'tinymce/core/api/Editor';

const updateCount = (editor: Editor) => {
  const wordCount = WordCount.getEditorWordcount(editor);
  Events.fireWordCountUpdate(editor, wordCount);
};

const setup = (editor: Editor) => {
  const debouncedUpdate = Delay.debounce(() => updateCount(editor), 300);

  editor.on('init', () => {
    updateCount(editor);
    Delay.setEditorTimeout(editor, () => {
      editor.on('setcontent beforeaddundo undo redo keyup', debouncedUpdate);
    }, 0);
  });
};

export {
  setup,
  updateCount
};