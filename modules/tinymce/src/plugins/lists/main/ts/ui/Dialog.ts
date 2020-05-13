/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { isOlNode } from '../core/NodeType';
import { getParentList } from '../core/Selection';

const open = (editor: Editor) => {
  const dom = editor.dom;

  // Find the current list and skip opening if the selection isn't in an ordered list
  const currentList = getParentList(editor);
  if (!isOlNode(currentList)) {
    return;
  }

  editor.windowManager.open({
    title: 'List Properties',
    body: {
      type: 'panel',
      items: [
        {
          type: 'input',
          name: 'start',
          label: 'Start list at number',
          inputMode: 'numeric'
        }
      ]
    },
    initialData: {
      start: dom.getAttrib(currentList, 'start') || '1'
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
    onSubmit: (api) => {
      const data = api.getData();
      editor.undoManager.transact(() => {
        dom.setAttrib(getParentList(editor), 'start', data.start === '1' ? '' : data.start);
      });
      api.close();
    }
  });
};

export {
  open
};
