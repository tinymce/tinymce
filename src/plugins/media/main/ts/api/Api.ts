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

var get = function (editor) {
  var showDialog = function () {
    Dialog.showDialog(editor);
  };

  return {
    showDialog: showDialog
  };
};

export default <any> {
  get: get
};