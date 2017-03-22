/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
define(
  'tinymce.plugins.visualchars.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.core.util.Delay',
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.node.Element',
    'tinymce.plugins.visualchars.core.VisualChars'
  ],
  function (PluginManager, Delay, Arr, Element, VisualChars) {
    PluginManager.add('visualchars', function (editor) {
      var self = this, state;

      var toggleActiveState = function () {
        var self = this;

        editor.on('VisualChars', function (e) {
          self.active(e.state);
        });
      };

      var debouncedToggle = Delay.debounce(function () {
        VisualChars.toggle(editor);
      }, 300);

      if (editor.settings.forced_root_block !== false) {
        editor.on('keydown', function (e) {
          if (self.state === true) {
            e.keyCode === 13 ? VisualChars.toggle(editor) : debouncedToggle();
          }
        });
      }

      editor.addCommand('mceVisualChars', function () {
        var body = editor.getBody(), selection = editor.selection, bookmark;

        state = !state;
        self.state = state;
        editor.fire('VisualChars', { state: state });

        bookmark = selection.getBookmark();

        if (state === true) {
          VisualChars.show(editor, body);
        } else {
          VisualChars.hide(editor, body);
        }

        selection.moveToBookmark(bookmark);
      });

      editor.addButton('visualchars', {
        title: 'Show invisible characters',
        cmd: 'mceVisualChars',
        onPostRender: toggleActiveState
      });

      editor.addMenuItem('visualchars', {
        text: 'Show invisible characters',
        cmd: 'mceVisualChars',
        onPostRender: toggleActiveState,
        selectable: true,
        context: 'view',
        prependToContext: true
      });
    });

    return function () {};
  }
);