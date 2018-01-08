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

var get = function (editor) {
  return {
    backspaceDelete: function (isForward) {
      Delete.backspaceDelete(editor, isForward);
    }
  };
};

export default <any> {
  get: get
};