/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Anchor from '../core/Anchor';

const insertAnchor = function (editor: Editor, newId: string) {
  if (!Anchor.isValidId(newId)) {
    editor.windowManager.alert(
      'Id should start with a letter, followed only by letters, numbers, dashes, dots, colons or underscores.'
    );
    return true;
  } else {
    Anchor.insert(editor, newId);
    return false;
  }
};

const open = function (editor: Editor) {
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
          placeholder: 'example'
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
    onSubmit (api) {
      if (!insertAnchor(editor, api.getData().id)) { // TODO we need a better way to do validation
        api.close();
      }
    }
  });
};

export default {
  open
};