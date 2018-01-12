/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Actions from '../core/Actions';

const register = function (editor, fullscreenState) {
  editor.addCommand('mceFullScreen', function () {
    Actions.toggleFullscreen(editor, fullscreenState);
  });
};

export default {
  register
};