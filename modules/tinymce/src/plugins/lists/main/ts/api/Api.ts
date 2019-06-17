/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Delete from '../core/Delete';

const get = function (editor) {
  return {
    backspaceDelete (isForward) {
      Delete.backspaceDelete(editor, isForward);
    }
  };
};

export default {
  get
};