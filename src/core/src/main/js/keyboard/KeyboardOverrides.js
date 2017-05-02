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
    'tinymce.core.keyboard.BoundarySelection',
    'tinymce.core.keyboard.DeleteBackspaceKeys',
    'tinymce.core.keyboard.EnterKey',
    'tinymce.core.keyboard.SpaceKey'
  ],
  function (ArrowKeys, BoundarySelection, DeleteBackspaceKeys, EnterKey, SpaceKey) {
    var setup = function (editor) {
      var caret = BoundarySelection.setupSelectedState(editor);

      ArrowKeys.setup(editor, caret);
      DeleteBackspaceKeys.setup(editor, caret);
      EnterKey.setup(editor);
      SpaceKey.setup(editor);
    };

    return {
      setup: setup
    };
  }
);