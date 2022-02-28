import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor, dialogOpener: () => void): void => {
  editor.ui.registry.addButton('help', {
    icon: 'help',
    tooltip: 'Help',
    onAction: dialogOpener
  });

  editor.ui.registry.addMenuItem('help', {
    text: 'Help',
    icon: 'help',
    shortcut: 'Alt+0',
    onAction: dialogOpener
  });
};

export {
  register
};
