/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Api from './api/Api';
import Commands from './api/Commands';
import Keyboard from './core/Keyboard';
import Buttons from './ui/Buttons';

PluginManager.add('lists', function (editor) {
  Keyboard.setup(editor);
  Buttons.register(editor);
  Commands.register(editor);

  return Api.get(editor);
});

export default function () { }