/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

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
    onSetup: (api) => Util.listState(editor, 'OL', (active) => api.setDisabled(!active))
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
