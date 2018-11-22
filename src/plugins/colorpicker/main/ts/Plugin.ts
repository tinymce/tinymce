/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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