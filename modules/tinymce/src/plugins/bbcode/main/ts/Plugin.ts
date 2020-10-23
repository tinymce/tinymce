/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import * as Convert from './core/Convert';

export default function () {
  PluginManager.add('bbcode', function (editor) {
    editor.on('BeforeSetContent', function (e) {
      e.content = Convert.bbcode2html(e.content);
    });

    editor.on('PostProcess', function (e) {
      if (e.set) {
        e.content = Convert.bbcode2html(e.content);
      }

      if (e.get) {
        e.content = Convert.html2bbcode(e.content);
      }
    });
  });
}
