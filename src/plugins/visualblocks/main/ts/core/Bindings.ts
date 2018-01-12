/**
 * Bindings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Settings from '../api/Settings';
import VisualBlocks from './VisualBlocks';

const setup = function (editor, pluginUrl, enabledState) {
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