/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Settings from '../api/Settings';
import Content from '../core/Content';

const open = function (editor) {
  const minWidth = Settings.getMinWidth(editor);
  const minHeight = Settings.getMinHeight(editor);

  const editorContent = Content.getContent(editor);

  editor.windowManager.open({
    title: 'Source Code',
    size: 'large',
    body: {
      type: 'panel',
      items: [
        {
          type: 'textarea',
          name: 'code',
          multiline: true,
          flex: true,
          minWidth,
          minHeight,
          spellcheck: false,
          style: 'direction: ltr; text-align: left'
        }
      ]
    },
    buttons: [
      {
        type: 'submit',
        name: 'ok',
        text: 'Ok',
        primary: true
      },
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel',
      }
    ],
    initialData: {
      code: editorContent
    },
    onSubmit: (api) => {
      Content.setContent(editor, api.getData().code);
      api.close();
    }
  });

  // TODO - ask Spocke about this. Works without, is maybe an outdated comment?
  // Gecko has a major performance issue with textarea
  // contents so we need to set it when all reflows are done
  // win.find('#code').value(Content.getContent(editor));
};

export default {
  open
};