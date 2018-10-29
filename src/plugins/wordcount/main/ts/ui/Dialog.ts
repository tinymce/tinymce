import { Editor } from 'tinymce/core/api/Editor';
import { getEditorWordcount, getSelectionWordcount } from '../text/WordCount';

const open = (editor: Editor) => {
  const documentCount = getEditorWordcount(editor);
  const selectionCount = getSelectionWordcount(editor);
  editor.windowManager.open({
    title: 'Wordcount',
    body: {
      type: 'panel',
      items: [
        {
          type: 'table',
          header: ['Count', 'Document', 'Selection'],
          rows: [
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