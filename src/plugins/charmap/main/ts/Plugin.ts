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
import * as Autocompletion from './ui/Autocompletion';
import Buttons from './ui/Buttons';
import CharMap from './core/CharMap';

PluginManager.add('charmap', function (editor) {
  const charMap = CharMap.getCharMap(editor);
  Commands.register(editor, charMap);
  Buttons.register(editor);

  Autocompletion.init(editor, charMap[0]);

  return Api.get(editor);
});

export default function () { }