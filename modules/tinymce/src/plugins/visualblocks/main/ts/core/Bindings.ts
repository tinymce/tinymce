/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import * as Settings from '../api/Settings';
import * as VisualBlocks from './VisualBlocks';

const setup = (editor: Editor, pluginUrl: string, enabledState: Cell<boolean>) => {
  // Prevents the visualblocks from being presented in the preview of formats when that is computed
  editor.on('PreviewFormats AfterPreviewFormats', (e) => {
    if (enabledState.get()) {
      editor.dom.toggleClass(editor.getBody(), 'mce-visualblocks', e.type === 'afterpreviewformats');
    }
  });

  editor.on('init', () => {
    if (Settings.isEnabledByDefault(editor)) {
      VisualBlocks.toggleVisualBlocks(editor, pluginUrl, enabledState);
    }
  });
};

export {
  setup
};
