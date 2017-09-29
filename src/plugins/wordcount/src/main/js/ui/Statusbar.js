/**
 * Statusbar.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.wordcount.ui.Statusbar',
  [
    'tinymce.core.util.Delay',
    'tinymce.core.util.I18n',
    'tinymce.plugins.wordcount.text.WordCount'
  ],
  function (Delay, I18n, WordCount) {
    var setup = function (editor) {
      var wordsToText = function (editor) {
        return I18n.translate(['{0} words', WordCount.getCount(editor)]);
      };

      var update = function () {
        editor.theme.panel.find('#wordcount').text(wordsToText(editor));
      };

      editor.on('init', function () {
        var statusbar = editor.theme.panel && editor.theme.panel.find('#statusbar')[0];
        var debouncedUpdate = Delay.debounce(update, 300);

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

    return {
      setup: setup
    };
  }
);
