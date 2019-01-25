/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from 'tinymce/core/api/Editor';
import { getEditorWordcount, getSelectionWordcount } from '../text/WordCount';

const open = (editor: Editor) => {
  const documentCount = getEditorWordcount(editor);
  const selectionCount = getSelectionWordcount(editor);
  editor.windowManager.open({
    title: 'Word Count',
    body: {
      type: 'panel',
      items: [
        {
          type: 'table',
          header: ['Count', 'Document', 'Selection'],
          cells: [
            [
              'Words',
              String(documentCount.words),
              String(selectionCount.words)
            ],
            [
              'Characters (no spaces)',
              String(documentCount.charactersNoSpace),
              String(selectionCount.charactersNoSpace)
            ],
            [
              'Characters',
              String(documentCount.characters),
              String(selectionCount.characters)
            ],
          ]
        }
      ],
    },
    buttons: [
      {
        type: 'cancel',
        name: 'close',
        text: 'Close',
        primary: true
      }
    ]
  });
};

export {
  open
};