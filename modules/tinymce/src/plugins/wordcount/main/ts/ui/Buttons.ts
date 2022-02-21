import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {
  const onAction = () => editor.execCommand('mceWordCount');

  editor.ui.registry.addButton('wordcount', {
    tooltip: 'Word count',
    icon: 'character-count',
    onAction
  });

  editor.ui.registry.addMenuItem('wordcount', {
    text: 'Word count',
    icon: 'character-count',
    onAction
  });
};

export {
  register
};
