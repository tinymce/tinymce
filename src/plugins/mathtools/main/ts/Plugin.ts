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
// import SelectedLatex from './core/SelectedLatex';
import Buttons from './ui/Buttons';
import ContextToolbar from './ui/ContextToolbar';

PluginManager.add('mathtools', function (editor) {

  Commands.register(editor);
  Buttons.register(editor);
  ContextToolbar.register(editor);
  // SelectedLatex.setup(editor);
});

export default function () { }