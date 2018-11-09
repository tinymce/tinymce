import * as Dialog from './Dialog';

const register = function (editor) {
  editor.ui.registry.addButton('wordcount', {
    tooltip: 'Wordcount',
    icon: 'character-count',
    onAction: () => Dialog.open(editor)
  });
};

export {
  register
};