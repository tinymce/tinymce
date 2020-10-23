/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Actions from '../core/Actions';

const register = function (editor, toggleState) {
  editor.addCommand('mceVisualChars', function () {
    Actions.toggleVisualChars(editor, toggleState);
  });
};

export {
  register
};
