/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import { getSelectionTargets } from './selection/SelectionTargets';
import * as Buttons from './ui/Buttons';
import * as MenuItems from './ui/MenuItems';

const Plugin = (editor: Editor): void => {
  const selectionTargets = getSelectionTargets(editor);

  Options.register(editor);
  Commands.registerCommands(editor);

  MenuItems.addMenuItems(editor, selectionTargets);
  Buttons.addButtons(editor, selectionTargets);
  Buttons.addToolbars(editor);
};

export default (): void => {
  PluginManager.add('table', Plugin);
};
