import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';

import { isOlNode } from '../core/NodeType';
import { getParentList } from '../core/Selection';
import * as Util from '../core/Util';

const register = (editor: Editor): void => {
  const listProperties: Menu.MenuItemSpec = {
    text: 'List properties...',
    icon: 'ordered-list',
    onAction: () => editor.execCommand('mceListProps'),
    onSetup: (api) => Util.listState(editor, 'OL', api.setEnabled)
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
