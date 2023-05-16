import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {
  editor.ui.registry.addButton('ai', {
    tooltip: 'Artificial intelligence',
    icon: 'warning',
    onAction: () => editor.execCommand('mceAi')
  });
};

export {
  register
};
