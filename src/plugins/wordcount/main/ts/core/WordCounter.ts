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
import WordCount from '../text/WordCount';
import Events from '../api/Events';

const setup = function (editor) {
  const wordsToText = function (editor) {
    const wordCount = WordCount.getCount(editor);
    return I18n.translate(['{0} ' + (wordCount === 1 ? 'word' : 'words'), wordCount]);
  };

  const update = function () {
    Events.fireWordCountUpdate(editor, wordsToText(editor));
  };

  editor.on('init', function () {
    update();

    const debouncedUpdate = Delay.debounce(update, 300);

    Delay.setEditorTimeout(editor, function () {

      editor.on('setcontent beforeaddundo undo redo keyup', debouncedUpdate);
    }, 0);
  });
};

export default {
  setup
};