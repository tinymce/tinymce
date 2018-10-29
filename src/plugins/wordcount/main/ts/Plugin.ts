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
import * as Api from './api/Api';
import * as Wordcounter from './core/WordCounter';
import * as Buttons from './ui/Buttons';

PluginManager.add('wordcount', function (editor) {
  Buttons.register(editor);
  Wordcounter.setup(editor);
  return Api.get(editor);
});

export default function () { }