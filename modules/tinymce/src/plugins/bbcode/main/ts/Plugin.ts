/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Convert from './core/Convert';

export default (): void => {
  PluginManager.add('bbcode', (editor) => {
    // eslint-disable-next-line no-console
    console.warn('The bbcode plugin has been deprecated and marked for removal in TinyMCE 6.0');
    editor.on('BeforeSetContent', (e) => {
      e.content = Convert.bbcode2html(e.content);
    });

    editor.on('PostProcess', (e) => {
      if (e.set) {
        e.content = Convert.bbcode2html(e.content);
      }

      if (e.get) {
        e.content = Convert.html2bbcode(e.content);
      }
    });
  });
};
