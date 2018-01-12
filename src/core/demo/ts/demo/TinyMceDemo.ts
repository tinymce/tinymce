/**
 * TinyMceDemo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import EditorManager from 'tinymce/core/EditorManager';
import ModernTheme from 'tinymce/themes/modern/Theme';

export default function () {
  ModernTheme();

  const textarea = document.createElement('textarea');
  textarea.innerHTML = '<p>Bolt</p>';

  textarea.classList.add('tinymce');
  document.querySelector('#ephox-ui').appendChild(textarea);

  EditorManager.init({
    // imagetools_cors_hosts: ["moxiecode.cachefly.net"],
    // imagetools_proxy: "proxy.php",
    // imagetools_api_key: '123',

    // images_upload_url: 'postAcceptor.php',
    // images_upload_base_path: 'base/path',
    // images_upload_credentials: true,
    skin_url: '../../../../js/tinymce/skins/lightgray',
    setup (ed) {
      ed.addButton('demoButton', {
        type: 'button',
        text: 'Demo',
        onclick () {
          ed.insertContent('Hello world!');
        }
      });
    },

    selector: 'textarea.tinymce',
    theme: 'modern',
    toolbar1: 'demoButton bold italic',
    menubar: false
  });
}