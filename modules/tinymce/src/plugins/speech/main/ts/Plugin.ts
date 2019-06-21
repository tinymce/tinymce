/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Commands from './api/Commands';
import Buttons from './ui/Buttons';
import Actions from './core/Actions';

export default function () {
  PluginManager.add('speech', function (editor) {
    const actions = Actions.register(editor);
    Commands.register(editor, actions);
    Buttons.register(editor, actions);
  });
}