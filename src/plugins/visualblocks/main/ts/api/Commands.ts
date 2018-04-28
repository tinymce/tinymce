/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import VisualBlocks from '../core/VisualBlocks';

const register = function (editor, pluginUrl, enabledState) {
  editor.addCommand('mceVisualBlocks', function () {
    VisualBlocks.toggleVisualBlocks(editor, pluginUrl, enabledState);
  });
};

export default {
  register
};