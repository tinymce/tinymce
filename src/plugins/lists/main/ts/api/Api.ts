/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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