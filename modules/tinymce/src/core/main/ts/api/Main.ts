/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { TinyMCE, tinymce } from './Tinymce';

declare const module: any;
declare const window: any;

const exportToModuleLoaders = (tinymce: TinyMCE) => {
  if (typeof module === 'object') {
    try {
      module.exports = tinymce;
    } catch (_) {
      // It will thrown an error when running this module
      // within webpack where the module.exports object is sealed
    }
  }
};

const exportToWindowGlobal = (tinymce: TinyMCE) => {
  window.tinymce = tinymce;
  window.tinyMCE = tinymce;
};

exportToWindowGlobal(tinymce);
exportToModuleLoaders(tinymce);
