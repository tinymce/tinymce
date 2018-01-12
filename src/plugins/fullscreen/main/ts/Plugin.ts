/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/PluginManager';
import Api from './api/Api';
import Commands from './api/Commands';
import Buttons from './ui/Buttons';

PluginManager.add('fullscreen', function (editor) {
  const fullscreenState = Cell(null);

  Commands.register(editor, fullscreenState);
  Buttons.register(editor);

  editor.addShortcut('Ctrl+Shift+F', '', 'mceFullScreen');

  return Api.get(fullscreenState);
});

export default function () { }