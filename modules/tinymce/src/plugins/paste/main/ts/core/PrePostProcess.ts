/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import * as Settings from '../api/Settings';

const setup = (editor: Editor): void => {
  const plugin = editor.plugins.paste;

  const preProcess = Settings.getPreProcess(editor);
  if (preProcess) {
    editor.on('PastePreProcess', (e) => {
      preProcess.call(plugin, plugin, e);
    });
  }

  const postProcess = Settings.getPostProcess(editor);
  if (postProcess) {
    editor.on('PastePostProcess', (e) => {
      postProcess.call(plugin, plugin, e);
    });
  }
};

export {
  setup
};
