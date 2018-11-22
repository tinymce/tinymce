/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Throbber from 'tinymce/ui/Throbber';

const setup = function (editor, theme) {
  let throbber;

  editor.on('ProgressState', function (e) {
    throbber = throbber || new Throbber(theme.panel.getEl('body'));

    if (e.state) {
      throbber.show(e.time);
    } else {
      throbber.hide();
    }
  });
};

export default {
  setup
};