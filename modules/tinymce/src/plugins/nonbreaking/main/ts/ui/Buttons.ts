import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {
  const onAction = () => editor.execCommand('mceNonBreaking');

  editor.ui.registry.addButton('nonbreaking', {
    icon: 'non-breaking',
    tooltip: 'Nonbreaking space',
    onAction
  });

  editor.ui.registry.addMenuItem('nonbreaking', {
    icon: 'non-breaking',
    text: 'Nonbreaking space',
    onAction
  });
};

export {
  register
};
