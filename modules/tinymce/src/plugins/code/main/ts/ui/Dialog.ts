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
        type: 'togglebutton',
        name: 'dark_theme_toggle',
        text: 'Dark/light mode',
        tooltip: 'Dark/light mode',
        active: true,
      },

      {
        type: 'togglebutton',
        name: 'dark_theme_toggle',
        // text: !status.dark ? 'Dark/light mode' : 'Dark mode enabled',
        text: 'Dark/light mode 2',
        tooltip: 'Dark/light mode 2',
        icon: 'paste',
        active: true,
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
