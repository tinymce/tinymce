/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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