/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains all core logic for the code plugin.
 *
 * @class tinymce.code.Plugin
 * @private
 */
define(
  'tinymce.plugins.code.Plugin',
  [
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.PluginManager'
  ],
  function (DOMUtils, PluginManager) {
    PluginManager.add('code', function (editor) {
      function showDialog() {
        var win = editor.windowManager.open({
          title: "Source code",
          body: {
            type: 'textbox',
            name: 'code',
            multiline: true,
            minWidth: editor.getParam("code_dialog_width", 600),
            minHeight: editor.getParam("code_dialog_height", Math.min(DOMUtils.DOM.getViewPort().h - 200, 500)),
            spellcheck: false,
            style: 'direction: ltr; text-align: left'
          },
          onSubmit: function (e) {
            // We get a lovely "Wrong document" error in IE 11 if we
            // don't move the focus to the editor before creating an undo
            // transation since it tries to make a bookmark for the current selection
            editor.focus();

            editor.undoManager.transact(function () {
              editor.setContent(e.data.code);
            });

            editor.selection.setCursorLocation();
            editor.nodeChanged();
          }
        });

        // Gecko has a major performance issue with textarea
        // contents so we need to set it when all reflows are done
        win.find('#code').value(editor.getContent({ source_view: true }));
      }

      editor.addCommand("mceCodeEditor", showDialog);

      editor.addButton('code', {
        icon: 'code',
        tooltip: 'Source code',
        onclick: showDialog
      });

      editor.addMenuItem('code', {
        icon: 'code',
        text: 'Source code',
        context: 'tools',
        onclick: showDialog
      });
    });

    return function () { };
  }
);