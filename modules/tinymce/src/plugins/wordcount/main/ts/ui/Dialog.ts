import Editor from 'tinymce/core/api/Editor';

import { WordCountApi } from '../api/Api';

const open = (editor: Editor, api: WordCountApi): void => {
  editor.windowManager.open({
    title: 'Word Count',
    body: {
      type: 'panel',
      items: [
        {
          type: 'table',
          header: [ 'Count', 'Document', 'Selection' ],
          cells: [
            [
              'Words',
              String(api.body.getWordCount()),
              String(api.selection.getWordCount())
            ],
            [
              'Characters (no spaces)',
              String(api.body.getCharacterCountWithoutSpaces()),
              String(api.selection.getCharacterCountWithoutSpaces())
            ],
            [
              'Characters',
              String(api.body.getCharacterCount()),
              String(api.selection.getCharacterCount())
            ]
          ]
        }
      ]
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
