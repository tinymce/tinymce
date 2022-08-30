import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent } from 'tinymce/core/api/EventTypes';
import { Menu } from 'tinymce/core/api/ui/Ui';

import { isOlNode } from '../core/NodeType';
import { getParentList } from '../core/Selection';
import * as Util from '../core/Util';

const setupMenuButtonHandler = (editor: Editor, listName: string) => (api: Menu.MenuItemInstanceApi): () => void => {
  const menuButtonHandler = (e: NodeChangeEvent) =>
    api.setEnabled(Util.inList(e.parents, listName) && !Util.isWithinNonEditableList(editor, e.element));
  return Util.setNodeChangeHandler(editor, menuButtonHandler);
};

const register = (editor: Editor): void => {
  const listProperties: Menu.MenuItemSpec = {
    text: 'List properties...',
    icon: 'ordered-list',
    onAction: () => editor.execCommand('mceListProps'),
    onSetup: setupMenuButtonHandler(editor, 'OL')
  };

  editor.ui.registry.addMenuItem('listprops', listProperties);

  editor.ui.registry.addContextMenu('lists', {
    update: (node) => {
      const parentList = getParentList(editor, node);
      return isOlNode(parentList) ? [ 'listprops' ] : [ ];
    }
  });
};

export {
  register
};
