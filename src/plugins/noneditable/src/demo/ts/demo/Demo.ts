/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import EditorManager from 'tinymce/core/EditorManager';
import CodePlugin from 'tinymce/plugins/code/Plugin';
import NonEditablePlugin from 'tinymce/plugins/noneditable/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

/*eslint no-console:0 */



export default <any> function () {
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