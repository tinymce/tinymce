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
import Bind from './core/Bind';

PluginManager.add('contextmenu', function (editor) {
  const menu = Cell(null), visibleState = Cell(false);

  Bind.setup(editor, visibleState, menu);

  return Api.get(visibleState);
});

export default function () { }