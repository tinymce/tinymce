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

export default (): void => {
  PluginManager.add('legacyoutput', (editor) => {
    // eslint-disable-next-line no-console
    console.warn('The legacyoutput plugin has been deprecated and marked for removal in TinyMCE 6.0');
    Formats.setup(editor);
  });
};
