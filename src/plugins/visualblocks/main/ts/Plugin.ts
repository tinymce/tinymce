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
import Commands from './api/Commands';
import Bindings from './core/Bindings';
import Buttons from './ui/Buttons';

PluginManager.add('visualblocks', function (editor, pluginUrl) {
  const enabledState = Cell(false);

  Commands.register(editor, pluginUrl, enabledState);
  Buttons.register(editor, enabledState);
  Bindings.setup(editor, pluginUrl, enabledState);
});

export default function () { }