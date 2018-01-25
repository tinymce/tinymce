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
import Dialog from './ui/Dialog';

PluginManager.add('colorpicker', function (editor) {
  if (!editor.settings.color_picker_callback) {
    editor.settings.color_picker_callback = function (callback, value) {
      Dialog.open(editor, callback, value);
    };
  }
});

export default function () { }