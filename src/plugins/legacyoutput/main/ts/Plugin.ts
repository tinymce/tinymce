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