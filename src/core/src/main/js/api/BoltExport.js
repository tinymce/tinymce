/**
 * BoltExport.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'ephox/tinymce',
  [
    'global!window',
    'tinymce.core.api.Tinymce'
  ],
  function (window, tinymce) {
    window.tinymce = tinymce;
    window.tinyMCE = tinymce;
    return tinymce;
  }
);
