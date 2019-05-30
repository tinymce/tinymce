/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Tools from 'tinymce/core/api/util/Tools';
import Commands from './api/Commands';
import Buttons from './ui/Buttons';

PluginManager.add('advlist', function (editor) {
  const hasPlugin = function (editor, plugin) {
    const plugins = editor.settings.plugins ? editor.settings.plugins : '';
    return Tools.inArray(plugins.split(/[ ,]/), plugin) !== -1;
  };

  if (hasPlugin(editor, 'lists')) {
    Buttons.register(editor);
    Commands.register(editor);
  }
});

export default function () { }