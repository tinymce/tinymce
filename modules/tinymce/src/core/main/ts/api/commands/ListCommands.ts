import Editor from '../Editor';

const registerExecCommands = (editor: Editor): void => {
  editor.editorCommands.addCommands({
    'InsertUnorderedList,InsertOrderedList': (command) => {
      editor.getDoc().execCommand(command);

      // WebKit produces lists within block elements so we need to split them
      // we will replace the native list creation logic to custom logic later on
      // TODO: Remove this when the list creation logic is removed
      const listElm = editor.dom.getParent(editor.selection.getNode(), 'ol,ul');
      if (listElm) {
        const listParent = listElm.parentNode;

        // If list is within a text block then split that block
        if (listParent && /^(H[1-6]|P|ADDRESS|PRE)$/.test(listParent.nodeName)) {
          const bm = editor.selection.getBookmark();
          editor.dom.split(listParent, listElm);
          editor.selection.moveToBookmark(bm);
        }
      }
    }
  });
};

const registerQueryStateCommands = (editor: Editor): void => {
  editor.editorCommands.addCommands({
    'InsertUnorderedList,InsertOrderedList': (command) => {
      const list = editor.dom.getParent(editor.selection.getNode(), 'ul,ol') as HTMLElement;

      return list &&
        (
          command === 'insertunorderedlist' && list.tagName === 'UL' ||
          command === 'insertorderedlist' && list.tagName === 'OL'
        );
    }
  }, 'state');
};

export const registerCommands = (editor: Editor): void => {
  registerExecCommands(editor);
  registerQueryStateCommands(editor);
};
