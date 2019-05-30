/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const getKeyboardSpaces = function (editor) {
  const spaces = editor.getParam('nonbreaking_force_tab', 0);

  if (typeof spaces === 'boolean') {
    return spaces === true ? 3 : 0;
  } else {
    return spaces;
  }
};

export default {
  getKeyboardSpaces
};