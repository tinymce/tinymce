/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const register = function (editor) {
  editor.addCommand('InsertHorizontalRule', function () {
    editor.execCommand('mceInsertContent', false, '<hr />');
  });
};

export default {
  register
};