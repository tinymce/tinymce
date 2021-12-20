/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import PluginManager from 'tinymce/core/api/PluginManager';

import { Api, getApi } from './api/Api';
import * as Commands from './api/Commands';
import * as Options from './api/Options';
import { getSelectionTargets } from './selection/SelectionTargets';
import * as Buttons from './ui/Buttons';
import * as MenuItems from './ui/MenuItems';

const Plugin = (editor: Editor): Api => {
  Options.register(editor);

  // TODO: TINY-8353 Remove fakeClipboard references
  const tableModel = editor.model.table;
  const clipboard = tableModel?.fakeClipboard;
  const selectionTargets = getSelectionTargets(editor);

  Commands.registerCommands(editor);

  MenuItems.addMenuItems(editor, selectionTargets, clipboard);
  Buttons.addButtons(editor, selectionTargets, clipboard);
  Buttons.addToolbars(editor);

  return getApi(editor, clipboard);
};

export default (): void => {
  PluginManager.add('table', Plugin);
};
