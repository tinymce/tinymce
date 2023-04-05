import Editor from 'tinymce/core/api/Editor';

import * as Content from '../core/Content';

const open = (editor: Editor): void => {
  const editorContent = Content.getContent(editor);

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
        text: 'Cancel'
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
};

export {
  open
};
