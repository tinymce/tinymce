import Editor from 'tinymce/core/api/Editor';
import * as Options from '../api/Options';

import * as Anchor from '../core/Anchor';

const insertAnchor = (editor: Editor, newId: string): boolean => {
  if (!Anchor.isValidId(newId)) {
    editor.windowManager.alert(
      Options.anchorInvalidMessage(editor)
    );
    return false;
  } else {
    Anchor.insert(editor, newId);
    return true;
  }
};

const open = (editor: Editor): void => {
  const currentId = Anchor.getId(editor);

  editor.windowManager.open({
    title: 'Anchor',
    size: 'normal',
    body: {
      type: 'panel',
      items: [
        {
          name: 'id',
          type: 'input',
          label: 'ID',
          placeholder: Options.anchorNamePlaceholder(editor),
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
      id: currentId
    },
    onSubmit: (api) => {
      if (insertAnchor(editor, api.getData().id)) { // TODO we need a better way to do validation
        api.close();
      }
    }
  });
};

export {
  open
};
