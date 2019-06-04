/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Commands from './api/Commands';
import Actions from './core/Actions';
import Keyboard from './core/Keyboard';
import Controls from './ui/Controls';

export default function () {
  PluginManager.add('link', function (editor) {
    Controls.setupButtons(editor);
    Controls.setupMenuItems(editor);
    Controls.setupContextMenu(editor);
    Controls.setupContextToolbars(editor);
    Actions.setupGotoLinks(editor);
    Commands.register(editor);
    Keyboard.setup(editor);
  });
}
