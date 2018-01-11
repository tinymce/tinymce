/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import PluginManager from 'tinymce/core/PluginManager';
import Keys from './core/Keys';

PluginManager.add('autolink', function (editor) {
  Keys.setup(editor);
});

export default function () { }