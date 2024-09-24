import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {
  const onAction = () => editor.execCommand('mcePreview');

  editor.ui.registry.addButton('preview', {
    icon: 'preview',
    tooltip: 'Preview',
    onAction,
    context: 'any'
  });

  editor.ui.registry.addMenuItem('preview', {
    icon: 'preview',
    text: 'Preview',
    onAction,
    context: 'any'
  });
};

export {
  register
};
