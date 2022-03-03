import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {
  const onAction = () => editor.execCommand('mceTemplate');

  editor.ui.registry.addButton('template', {
    icon: 'template',
    tooltip: 'Insert template',
    onAction
  });

  editor.ui.registry.addMenuItem('template', {
    icon: 'template',
    text: 'Insert template...',
    onAction
  });
};

export {
  register
};
