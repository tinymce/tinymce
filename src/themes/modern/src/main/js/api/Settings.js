/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.themes.modern.api.Settings',
  [
  ],
  function () {
    var isBrandingEnabled = function (editor) {
      return editor.getParam('branding', true);
    };

    return {
      isBrandingEnabled: isBrandingEnabled
    };
  }
);
