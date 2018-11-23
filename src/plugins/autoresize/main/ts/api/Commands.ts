/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Resize from '../core/Resize';

const register = function (editor, oldSize) {
  editor.addCommand('mceAutoResize', function () {
    Resize.resize(editor, oldSize);
  });
};

export default {
  register
};