import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {
  const onAction = () => editor.execCommand('mcePageBreak');

  editor.ui.registry.addButton('pagebreak', {
    icon: 'page-break',
    tooltip: 'Page break',
    onAction
  });

  editor.ui.registry.addMenuItem('pagebreak', {
    text: 'Page break',
    icon: 'page-break',
    onAction
  });
};

export {
  register
};
