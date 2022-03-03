import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {
  editor.ui.registry.addButton('charmap', {
    icon: 'insert-character',
    tooltip: 'Special character',
    onAction: () => editor.execCommand('mceShowCharmap')
  });

  editor.ui.registry.addMenuItem('charmap', {
    icon: 'insert-character',
    text: 'Special character...',
    onAction: () => editor.execCommand('mceShowCharmap')
  });
};

export {
  register
};
