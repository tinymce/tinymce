/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.codesample.ui.Dialog',
  [
    'tinymce.plugins.codesample.api.Settings',
    'tinymce.plugins.codesample.core.CodeSample',
    'tinymce.plugins.codesample.core.Languages'
  ],
  function (Settings, CodeSample, Languages) {
    return {
      open: function (editor) {
        var minWidth = Settings.getDialogMinWidth(editor);
        var minHeight = Settings.getDialogMinHeight(editor);
        // var currentLanguage = Languages.getCurrentLanguage(editor);
        var currentLanguages = Languages.getLanguages(editor);
        // var currentCode = CodeSample.getCurrentCode(editor);
        var datas = CodeSample.getDatas(editor);

        editor.windowManager.open({
          title: "Insert/Edit code sample",
          minWidth: minWidth,
          minHeight: minHeight,
          layout: 'flex',
          direction: 'column',
          align: 'stretch',
          body: [
            {
              type: 'listbox',
              name: 'language',
              label: 'Language',
              maxWidth: 200,
              value: datas.language,
              values: currentLanguages
            },

            {
              type: 'checkbox',
              name: 'isLineNumbers',
              label: 'Line numbers',
              checked: datas.isLineNumbers,
              values: currentLanguages
            },

            {
              type: 'textbox',
              name: 'highlightedLines',
              label: 'Highligth lines',
              placeholder: 'For example:  2,5-8,12, ...',
              multiline: false,
              spellcheck: false,
              classes: 'monospace',
              value: datas.highlightedLines
            },

            /*
            {
              type: 'textbox',
              name: 'dataSrc',
              label: 'File',
              multiline: false,
              spellcheck: false,
              classes: 'monospace',
              value: datas.dataSrc
            },
             * */
            {
              type: 'filepicker',
              filetype: 'codesample',
              name: 'dataSrc',
              label: 'File',
              placeholder: 'On this server',
              value: datas.dataSrc
            },

            {
              type: 'textbox',
              name: 'url',
              label: 'Url',
              placeholder: 'From Github, Gist, Bitbucket,...',
              multiline: false,
              spellcheck: false,
              classes: 'monospace',
              value: datas.url
            },

            {
              type: 'textbox',
              name: 'code',
              multiline: true,
              spellcheck: false,
              ariaLabel: 'Code view',
              flex: 1,
              style: 'direction: ltr; text-align: left',
              classes: 'monospace',
              value: datas.code,
              autofocus: true
            }
          ],
          onSubmit: function (e) {
            CodeSample.insertCodeSample(editor, e.data);
          }
        });
      }
    };
  }
);