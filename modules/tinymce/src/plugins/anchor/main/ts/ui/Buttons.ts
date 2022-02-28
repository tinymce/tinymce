import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {
  editor.ui.registry.addToggleButton('anchor', {
    icon: 'bookmark',
    tooltip: 'Anchor',
    onAction: () => editor.execCommand('mceAnchor'),
    onSetup: (buttonApi) => editor.selection.selectorChangedWithUnbind('a:not([href])', buttonApi.setActive).unbind
  });

  editor.ui.registry.addMenuItem('anchor', {
    icon: 'bookmark',
    text: 'Anchor...',
    onAction: () => editor.execCommand('mceAnchor')
  });
};

export {
  register
};
