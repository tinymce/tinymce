/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const firePreProcess = function (editor, args) {
  return editor.fire('PreProcess', args);
};

const firePostProcess = function (editor, args) {
  return editor.fire('PostProcess', args);
};

export default {
  firePreProcess,
  firePostProcess
};