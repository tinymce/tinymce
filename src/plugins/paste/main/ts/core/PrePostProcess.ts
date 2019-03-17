/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Settings from '../api/Settings';
import Editor from 'tinymce/core/api/Editor';

const setup = function (editor: Editor) {
  const plugin = editor.plugins.paste;

  const preProcess = Settings.getPreProcess(editor);
  if (preProcess) {
    editor.on('PastePreProcess', function (e) {
      preProcess.call(plugin, plugin, e);
    });
  }

  const postProcess = Settings.getPostProcess(editor);
  if (postProcess) {
    editor.on('PastePostProcess', function (e) {
      postProcess.call(plugin, plugin, e);
    });
  }
};

export default {
  setup
};