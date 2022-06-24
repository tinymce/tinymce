import Editor from '../api/Editor';

const setup = (editor: Editor): void => {
  // Add some inline shortcuts
  editor.addShortcut('meta+b', '', 'Bold');
  editor.addShortcut('meta+i', '', 'Italic');
  editor.addShortcut('meta+u', '', 'Underline');

  // BlockFormat shortcuts keys
  for (let i = 1; i <= 6; i++) {
    editor.addShortcut('access+' + i, '', [ 'FormatBlock', false, 'h' + i ]);
  }

  editor.addShortcut('access+7', '', [ 'FormatBlock', false, 'p' ]);
  editor.addShortcut('access+8', '', [ 'FormatBlock', false, 'div' ]);
  editor.addShortcut('access+9', '', [ 'FormatBlock', false, 'address' ]);
};

export {
  setup
};
