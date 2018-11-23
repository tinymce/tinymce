/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import TextColor from '../core/TextColor';

const register = function (editor) {
  editor.addCommand('mceApplyTextcolor', function (format, value) {
    TextColor.applyFormat(editor, format, value);
  });

  editor.addCommand('mceRemoveTextcolor', function (format) {
    TextColor.removeFormat(editor, format);
  });
};

export default {
  register
};
