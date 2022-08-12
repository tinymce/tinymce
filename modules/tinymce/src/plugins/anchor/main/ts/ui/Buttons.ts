import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {
  const onAction = () => editor.execCommand('mceAnchor');

  editor.ui.registry.addToggleButton('anchor', {
    icon: 'bookmark',
    tooltip: 'Anchor',
    onAction,
    onSetup: (buttonApi) => editor.selection.selectorChangedWithUnbind('a:not([href])', buttonApi.setActive).unbind
  });

  editor.ui.registry.addMenuItem('anchor', {
    icon: 'bookmark',
    text: 'Anchor...',
    onAction
  });
};

export {
  register
};
