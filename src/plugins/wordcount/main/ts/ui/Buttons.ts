import * as Dialog from './Dialog';

const register = function (editor) {
  const onAction = () => Dialog.open(editor);
  editor.ui.registry.addButton('wordcount', {
    tooltip: 'Show invisible characters',
    icon: 'character-count',
    onAction
  });
};

export {
  register
};