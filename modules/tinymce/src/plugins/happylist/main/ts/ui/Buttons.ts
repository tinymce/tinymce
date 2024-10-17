import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {
  const getSelectedList = () => {
    const selectedNode = editor.selection.getNode();
    return editor.dom.getParent(selectedNode, 'ul');
  };

  editor.ui.registry.addButton('happylist', {
    text: 'Happy List',
    onAction: () => {
      const list = getSelectedList();

      if (list && list.id === 'custom-id') {
        list.removeAttribute('id');
        return;
      }

      const newId = 'custom-id';

      if (list) {
        list.id = newId;
      }

      editor.dom.addStyle(`
        ul#${newId} {
          list-style: none; 
          padding: 0;
          margin: 0;
        }
        ul#${newId} > li {
          padding-left: 16px;
        }
        ul#${newId} > li::before {
          content: '😀';
          padding-right: 8px;
        }`
      );
    },
    onSetup: (api) => {
      const enable = () => api.setEnabled(!!getSelectedList());
      editor.on('NodeChange', enable);
      enable();

      return () => {
        editor.off('NodeChange', enable);
      };
    }
  });
};

export { register };
