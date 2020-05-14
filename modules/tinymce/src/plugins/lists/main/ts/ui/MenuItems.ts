/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu } from '@ephox/bridge';
import Editor from 'tinymce/core/api/Editor';
import { isOlNode } from '../core/NodeType';
import { getParentList } from '../core/Selection';
import * as Util from '../core/Util';
import * as Dialog from './Dialog';

const register = (editor: Editor) => {
  const listProperties: Menu.MenuItemApi = {
    text: 'List properties...',
    icon: 'ordered-list',
    onAction: () => Dialog.open(editor),
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
