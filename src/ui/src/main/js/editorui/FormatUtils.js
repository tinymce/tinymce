/**
 * FormatUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.ui.editorui.FormatUtils',
  [
  ],
  function () {
    var toggleFormat = function (editor, fmt) {
      return function () {
        editor.execCommand('mceToggleFormat', false, fmt);
      };
    };

    var postRenderFormat = function (editor, name) {
      return function () {
        var self = this;

        // TODO: Fix this
        if (editor.formatter) {
          editor.formatter.formatChanged(name, function (state) {
            self.active(state);
          });
        } else {
          editor.on('init', function () {
            editor.formatter.formatChanged(name, function (state) {
              self.active(state);
            });
          });
        }
      };
    };

    return {
      toggleFormat: toggleFormat,
      postRenderFormat: postRenderFormat
    };
  }
);
