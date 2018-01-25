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
import PluginManager from 'tinymce/core/api/PluginManager';
import Api from './api/Api';
import Commands from './api/Commands';
import Keyboard from './core/Keyboard';
import * as Buttons from './ui/Buttons';

PluginManager.add('visualchars', function (editor) {
  const toggleState = Cell(false);

  Commands.register(editor, toggleState);
  Buttons.register(editor);
  Keyboard.setup(editor, toggleState);

  return Api.get(toggleState);
});

export default function () {}