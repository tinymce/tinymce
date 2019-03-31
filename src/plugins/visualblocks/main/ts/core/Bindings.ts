/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Settings from '../api/Settings';
import VisualBlocks from './VisualBlocks';
import Editor from 'tinymce/core/api/Editor';
import { Cell } from '@ephox/katamari';

const setup = function (editor: Editor, pluginUrl: string, enabledState: Cell<boolean>) {
  // Prevents the visualblocks from being presented in the preview of formats when that is computed
  editor.on('PreviewFormats AfterPreviewFormats', function (e) {
    if (enabledState.get()) {
      editor.dom.toggleClass(editor.getBody(), 'mce-visualblocks', e.type === 'afterpreviewformats');
    }
  });

  editor.on('init', function () {
    if (Settings.isEnabledByDefault(editor)) {
      VisualBlocks.toggleVisualBlocks(editor, pluginUrl, enabledState);
    }
  });

  editor.on('remove', function () {
    editor.dom.removeClass(editor.getBody(), 'mce-visualblocks');
  });
};

export default {
  setup
};