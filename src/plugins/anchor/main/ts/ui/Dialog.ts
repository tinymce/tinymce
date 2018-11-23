/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Anchor from '../core/Anchor';

const insertAnchor = function (editor, newId) {
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

const open = function (editor) {
  const currentId = Anchor.getId(editor);

  editor.windowManager.open({
    title: 'Anchor',
    body: { type: 'textbox', name: 'id', size: 40, label: 'Id', value: currentId },
    onsubmit (e) {
      const newId = e.data.id;

      if (insertAnchor(editor, newId)) {
        e.preventDefault();
      }
    }
  });
};

export default {
  open
};