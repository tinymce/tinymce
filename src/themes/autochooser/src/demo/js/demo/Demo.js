/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-console:0 */

define(
  'tinymce.themes.autochooser.demo.Demo',
  [
    'tinymce.core.EditorManager',
    'tinymce.plugins.code.Plugin',
    'tinymce.themes.autochooser.Theme'
  ],
  function (EditorManager, CodePlugin, Theme) {
    return function () {
      Theme();
      CodePlugin();

      EditorManager.init({
        selector: '.tiny-text',
        theme: 'autochooser',
        plugins: 'code',
        autochooser_mobile_skin_url: '../../../../mobile/src/main/css',
        autochooser_modern_skin_url: '../../../../../skins/lightgray/dist/lightgray'
      });
    };
  }
);