/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Commands from './api/Commands';
import Buttons from './ui/Buttons';

export default function () {
  PluginManager.add('print', function (editor) {
    Commands.register(editor);
    Buttons.register(editor);
    editor.addShortcut('Meta+P', '', 'mcePrint');
  });
}
