/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Commands from './api/Commands';
import FilterContent from './core/FilterContent';
import Buttons from './ui/Buttons';
import Dialog from './ui/Dialog';
import Utils from './util/Utils';

export default function () {
  PluginManager.add('codesample', function (editor) {
    FilterContent.setup(editor);
    Buttons.register(editor);
    Commands.register(editor);

    editor.on('dblclick', function (ev) {
      if (Utils.isCodeSample(ev.target)) {
        Dialog.open(editor);
      }
    });
  });
}
