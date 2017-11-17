/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.api.Events',
  [
  ],
  function () {
    var firePreProcess = function (editor, args) {
      return editor.fire('PreProcess', args);
    };

    var firePostProcess = function (editor, args) {
      return editor.fire('PostProcess', args);
    };

    return {
      firePreProcess: firePreProcess,
      firePostProcess: firePostProcess
    };
  }
);
