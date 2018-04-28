/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const fireFullscreenStateChanged = function (editor, state) {
  editor.fire('FullscreenStateChanged', { state });
};

export default {
  fireFullscreenStateChanged
};