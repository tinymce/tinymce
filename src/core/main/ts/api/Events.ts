/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

var firePreProcess = function (editor, args) {
  return editor.fire('PreProcess', args);
};

var firePostProcess = function (editor, args) {
  return editor.fire('PostProcess', args);
};

export default {
  firePreProcess: firePreProcess,
  firePostProcess: firePostProcess
};