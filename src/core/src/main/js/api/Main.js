/**
 * Main.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.api.Main',
  [
    'tinymce.core.api.Tinymce',
    'tinymce.core.Register'
  ],
  function (tinymce, Register) {
    return function () {
      window.tinymce = tinymce;
      window.tinyMCE = tinymce;
      Register.exposeToModuleLoaders(tinymce);
      return tinymce;
    };
  }
);
