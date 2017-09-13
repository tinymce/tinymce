/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.anchor.ui.Buttons',
  [
  ],
  function () {
    var mceAnchorCommand = function (editor) {
      return function () {
        editor.execCommand('mceAnchor');
      };
    };

    var register = function (editor) {
      editor.addButton('anchor', {
        icon: 'anchor',
        tooltip: 'Anchor',
        onclick: mceAnchorCommand(editor),
        stateSelector: 'a:not([href])'
      });

      editor.addMenuItem('anchor', {
        icon: 'anchor',
        text: 'Anchor',
        context: 'insert',
        onclick: mceAnchorCommand(editor)
      });
    };

    return {
      register: register
    };
  }
);