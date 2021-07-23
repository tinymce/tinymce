/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Formats from './core/Formats';

/**
 * This class contains all core logic for the legacyoutput plugin.
 *
 * @class tinymce.legacyoutput.Plugin
 * @private
 */

export default () => {
  console.warn('Notice: The legacyoutput plugin has been marked for removal from TinyMCE 6.0');
  PluginManager.add('legacyoutput', (editor) => {
    Formats.setup(editor);
  });
};
