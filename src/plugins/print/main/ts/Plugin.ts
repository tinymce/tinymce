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
import Buttons from './ui/Buttons';

PluginManager.add('print', function (editor) {
  Commands.register(editor);
  Buttons.register(editor);
  editor.addShortcut('Meta+P', '', 'mcePrint');
});

export default function () { }