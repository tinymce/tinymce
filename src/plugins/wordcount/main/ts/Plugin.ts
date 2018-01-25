/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Api from './api/Api';
import Statusbar from './ui/Statusbar';

PluginManager.add('wordcount', function (editor) {
  Statusbar.setup(editor);
  return Api.get(editor);
});

export default function () { }