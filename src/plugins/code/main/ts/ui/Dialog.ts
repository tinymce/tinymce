/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Settings from '../api/Settings';
import Content from '../core/Content';

const open = function (editor) {
  const minWidth = Settings.getMinWidth(editor);
  const minHeight = Settings.getMinHeight(editor);

  const win = editor.windowManager.open({
    title: 'Source code',
    body: {
      type: 'textbox',
      name: 'code',
      multiline: true,
      minWidth,
      minHeight,
      spellcheck: false,
      style: 'direction: ltr; text-align: left'
    },
    onSubmit (e) {
      Content.setContent(editor, e.data.code);
    }
  });

  // Gecko has a major performance issue with textarea
  // contents so we need to set it when all reflows are done
  win.find('#code').value(Content.getContent(editor));
};

export default {
  open
};