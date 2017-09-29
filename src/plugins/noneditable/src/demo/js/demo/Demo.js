/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-console:0 */

define(
  'tinymce.plugins.noneditable.demo.Demo',
  [
    'global!document',
    'tinymce.core.EditorManager',
    'tinymce.plugins.code.Plugin',
    'tinymce.plugins.noneditable.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (document, EditorManager, CodePlugin, NonEditablePlugin, ModernTheme) {
    return function () {
      CodePlugin();
      NonEditablePlugin();
      ModernTheme();

      var button = document.querySelector('button.clicky');
      button.addEventListener('click', function () {
        EditorManager.activeEditor.insertContent(content);
      });
      var content = '<span class="mceNonEditable">[NONEDITABLE]</span>';
      var button2 = document.querySelector('button.boldy');
      button2.addEventListener('click', function () {
        EditorManager.activeEditor.execCommand('bold');
      });


      EditorManager.init({
        selector: "div.tinymce",
        theme: "modern",
        inline: true,
        skin_url: "../../../../../skins/lightgray/dist/lightgray",
        plugins: "noneditable code",
        toolbar: "code",
        height: 600
      });

      EditorManager.init({
        selector: "textarea.tinymce",
        theme: "modern",
        skin_url: "../../../../../skins/lightgray/dist/lightgray",
        plugins: "noneditable code",
        toolbar: "code",
        height: 600
      });


    };
  }
);