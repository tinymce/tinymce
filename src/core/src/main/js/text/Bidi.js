/**
 * Bidi.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.text.Bidi',
  [
  ],
  function () {
    var strongRtl = /[\u0591-\u07FF\uFB1D-\uFDFF\uFE70-\uFEFC]/;

    var hasStrongRtl = function (text) {
      return strongRtl.test(text);
    };

    return {
      hasStrongRtl: hasStrongRtl
    };
  }
);