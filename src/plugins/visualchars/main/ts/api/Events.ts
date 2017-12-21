/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

var fireVisualChars = function (editor, state) {
  return editor.fire('VisualChars', { state: state });
};

export default <any> {
  fireVisualChars: fireVisualChars
};