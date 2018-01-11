/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const fireSkinLoaded = function (editor) {
  editor.fire('SkinLoaded');
};

const fireBeforeRenderUI = function (editor) {
  return editor.fire('BeforeRenderUI');
};

export default {
  fireSkinLoaded,
  fireBeforeRenderUI
};