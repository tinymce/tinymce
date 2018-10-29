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
import I18n from 'tinymce/core/api/util/I18n';
import * as WordCount from '../text/WordCount';
import * as Events from '../api/Events';
import { Editor } from 'tinymce/core/api/Editor';

const setup = (editor: Editor) => {
  const wordsToText = (editor: Editor) => {
    const wordCount = WordCount.getEditorWordcount(editor);
    return I18n.translate(['{0} ' + (wordCount.words === 1 ? 'word' : 'words'), wordCount.words]);
  };

  const update = () => {
    Events.fireWordCountUpdate(editor, wordsToText(editor));
  };
  const debouncedUpdate = Delay.debounce(update, 300);

  editor.on('init', () => {
    update();
    Delay.setEditorTimeout(editor, () => {
      editor.on('setcontent beforeaddundo undo redo keyup', debouncedUpdate);
    }, 0);
  });
};

export {
  setup
};