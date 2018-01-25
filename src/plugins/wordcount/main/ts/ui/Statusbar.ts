/**
 * Statusbar.js
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

const setup = function (editor) {
  const wordsToText = function (editor) {
    return I18n.translate(['{0} words', WordCount.getCount(editor)]);
  };

  const update = function () {
    editor.theme.panel.find('#wordcount').text(wordsToText(editor));
  };

  editor.on('init', function () {
    const statusbar = editor.theme.panel && editor.theme.panel.find('#statusbar')[0];
    const debouncedUpdate = Delay.debounce(update, 300);

    if (statusbar) {
      Delay.setEditorTimeout(editor, function () {
        statusbar.insert({
          type: 'label',
          name: 'wordcount',
          text: wordsToText(editor),
          classes: 'wordcount',
          disabled: editor.settings.readonly
        }, 0);

        editor.on('setcontent beforeaddundo undo redo keyup', debouncedUpdate);
      }, 0);
    }
  });
};

export default {
  setup
};