/**
 * Main.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tinymce from './Tinymce';

declare const window: any;

const exportToModuleLoaders = (tinymce) => {
  if (typeof module === 'object') {
    module.exports = tinymce;
  }
};

const exportToWindowGlobal = (tinymce) => {
  window.tinymce = tinymce;
  window.tinyMCE = tinymce;
};

exportToWindowGlobal(Tinymce);
exportToModuleLoaders(Tinymce);
