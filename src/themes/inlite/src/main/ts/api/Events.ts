/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

var fireSkinLoaded = function (editor) {
  editor.fire('SkinLoaded');
};

var fireBeforeRenderUI = function (editor) {
  return editor.fire('BeforeRenderUI');
};

export default <any> {
  fireSkinLoaded: fireSkinLoaded,
  fireBeforeRenderUI: fireBeforeRenderUI
};