/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Commands from './api/Commands';
import Keyboard from './core/Keyboard';
import Buttons from './ui/Buttons';
import Editor from '../../../../core/main/ts/api/Editor';

/**
 * This class contains all core logic for the nonbreaking plugin.
 *
 * @class tinymce.nonbreaking.Plugin
 * @private
 */

export default function () {
  PluginManager.add('nonbreaking', function (editor: Editor) {
    Commands.register(editor);
    Buttons.register(editor);
    Keyboard.setup(editor);
  });
}
