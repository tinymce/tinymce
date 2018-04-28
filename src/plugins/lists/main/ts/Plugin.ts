/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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