/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getKeyboardSpaces = function (editor: Editor) {
  const spaces = editor.getParam('nonbreaking_force_tab', 0);

  if (typeof spaces === 'boolean') {
    return spaces === true ? 3 : 0;
  } else {
    return spaces;
  }
};

const wrapNbsps = function (editor: Editor) {
  return editor.getParam('nonbreaking_wrap', true, 'boolean');
};

export {
  getKeyboardSpaces,
  wrapNbsps
};
