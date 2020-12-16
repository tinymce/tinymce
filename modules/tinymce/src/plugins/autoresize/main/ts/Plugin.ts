/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import * as Commands from './api/Commands';
import * as Resize from './core/Resize';

/**
 * This class contains all core logic for the autoresize plugin.
 *
 * @class tinymce.autoresize.Plugin
 * @private
 */

export default () => {
  PluginManager.add('autoresize', (editor) => {
    // If autoresize is enabled, disable resize if the user hasn't explicitly enabled it
    if (!editor.settings.hasOwnProperty('resize')) {
      editor.settings.resize = false;
    }
    if (!editor.inline) {
      const oldSize = Cell(0);
      Commands.register(editor, oldSize);
      Resize.setup(editor, oldSize);
    }
  });
};
