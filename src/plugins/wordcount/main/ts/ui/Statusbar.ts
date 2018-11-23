/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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