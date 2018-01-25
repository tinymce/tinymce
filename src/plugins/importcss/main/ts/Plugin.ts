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
import ImportCss from './core/ImportCss';

PluginManager.add('importcss', function (editor) {
  ImportCss.setup(editor);
  return Api.get(editor);
});

export default function () { }