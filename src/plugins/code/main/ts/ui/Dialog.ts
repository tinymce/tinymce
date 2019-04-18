/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Content from '../core/Content';
import Editor from 'tinymce/core/api/Editor';

const open = function (editor: Editor) {
  const editorContent: string = Content.getContent(editor);

  editor.windowManager.open({
    title: 'Source Code',
    size: 'large',
    body: {
      type: 'panel',
      items: [
        {
          type: 'textarea',
          name: 'code'
        }
      ]
    },
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel',
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
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