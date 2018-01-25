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
import Commands from './api/Commands';
import Actions from './core/Actions';
import Keyboard from './core/Keyboard';
import Controls from './ui/Controls';

PluginManager.add('link', function (editor) {
  Controls.setupButtons(editor);
  Controls.setupMenuItems(editor);
  Controls.setupContextToolbars(editor);
  Actions.setupGotoLinks(editor);
  Commands.register(editor);
  Keyboard.setup(editor);
});

export default function () { }