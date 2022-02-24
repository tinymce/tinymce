import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {
  const onAction = () => editor.execCommand('mceEmoticons');

  editor.ui.registry.addButton('emoticons', {
    tooltip: 'Emojis',
    icon: 'emoji',
    onAction
  });

  editor.ui.registry.addMenuItem('emoticons', {
    text: 'Emojis...',
    icon: 'emoji',
    onAction
  });
};

export {
  register
};
