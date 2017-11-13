/**
 * Keyboard.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.lists.core.Keyboard',
  [
    'tinymce.core.util.VK',
    'tinymce.plugins.lists.actions.Indent',
    'tinymce.plugins.lists.actions.Outdent',
    'tinymce.plugins.lists.api.Settings',
    'tinymce.plugins.lists.core.Delete'
  ],
  function (VK, Indent, Outdent, Settings, Delete) {
    var setupTabKey = function (editor) {
      editor.on('keydown', function (e) {
        // Check for tab but not ctrl+tab since it switches browser tabs on any OS
        if (e.keyCode !== VK.TAB || (e.ctrlKey && !e.altKey)) {
          return;
        }

        if (editor.dom.getParent(editor.selection.getStart(), 'LI,DT,DD')) {
          e.preventDefault();

          if (e.shiftKey) {
            Outdent.outdentSelection(editor);
          } else {
            Indent.indentSelection(editor);
          }
        }
      });
    };

    var setup = function (editor) {
      if (Settings.shouldIndentOnTab(editor)) {
        setupTabKey(editor);
      }

      Delete.setup(editor);
    };

    return {
      setup: setup
    };
  }
);

