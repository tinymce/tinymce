import { Dialog } from '@ephox/bridge';

import Editor from 'tinymce/core/api/Editor';
import { WindowParams } from 'tinymce/core/api/WindowManager';

const dummyDialog: Dialog.DialogSpec<{}> = {
  title: 'Dummy dialog',
  body: {
    type: 'panel',
    items: [
      {
        type: 'htmlpanel',
        html: 'Lorem ipsum'
      }
    ]
  },
  buttons: [
    {
      type: 'submit',
      text: 'Ok'
    }
  ]
};

const open = (editor: Editor, params?: WindowParams): Dialog.DialogInstanceApi<{}> =>
  editor.windowManager.open(dummyDialog, params);

export {
  open
};
