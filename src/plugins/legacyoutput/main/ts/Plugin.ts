/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
// import Formats from './core/Formats';
// import Buttons from './ui/Buttons';

/**
 * This class contains all core logic for the legacyoutput plugin.
 *
 * @class tinymce.legacyoutput.Plugin
 * @private
 */

PluginManager.add('legacyoutput', function (editor) {
  console.error('Legacy output plugin has not yet been updated for TinyMCE 5');
  return;
  // Formats.setup(editor);
  // Buttons.register(editor);
});

export default function () { }