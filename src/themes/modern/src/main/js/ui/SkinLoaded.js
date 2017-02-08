/**
 * SkinLoaded.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.themes.modern.ui.SkinLoaded', [
  ],
  function () {
    var fireSkinLoaded = function (editor) {
      var done = function () {
        editor._skinLoaded = true;
        editor.fire('SkinLoaded');
      };

      return function () {
        if (editor.initialized) {
          done();
        } else {
          editor.on('init', done);
        }
      };
    };

    return {
      fireSkinLoaded: fireSkinLoaded
    };
  }
);
