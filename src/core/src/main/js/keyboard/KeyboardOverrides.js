/**
 * KeyboardOverrides.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.KeyboardOverrides',
  [
    'tinymce.core.keyboard.ArrowKeys',
    'tinymce.core.keyboard.DeleteBackspaceKeys',
    'tinymce.core.keyboard.EnterKey'
  ],
  function (ArrowKeys, DeleteBackspaceKeys, EnterKey) {
    var setup = function (editor) {
      ArrowKeys.setup(editor);
      DeleteBackspaceKeys.setup(editor);
      EnterKey.setup(editor);
    };

    return {
      setup: setup
    };
  }
);