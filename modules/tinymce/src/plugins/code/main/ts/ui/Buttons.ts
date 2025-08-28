import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {

  const onAction = () => editor.execCommand('mceCodeEditor');

  editor.ui.registry.addButton('code', {
    icon: 'sourcecode',
    tooltip: 'Source code',
    onAction
  });

  editor.ui.registry.addMenuItem('code', {
    icon: 'sourcecode',
    text: 'Source code',
    onAction
  });
};

export {
  register
};
