/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';

const register = function (editor: Editor) {
  editor.addCommand('mcePrint', function () {
    // TINY-3762 IE will print the current window instead of the iframe window
    // however using execCommand appears to make it print from the correct window
    if (Env.browser.isIE()) {
      editor.getDoc().execCommand('print', false, null);
    } else {
      editor.getWin().print();
    }
  });
};

export {
  register
};
