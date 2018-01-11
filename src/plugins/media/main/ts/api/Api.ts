/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Dialog from '../ui/Dialog';

const get = function (editor) {
  const showDialog = function () {
    Dialog.showDialog(editor);
  };

  return {
    showDialog
  };
};

export default {
  get
};