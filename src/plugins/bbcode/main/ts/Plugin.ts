/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Convert from './core/Convert';

PluginManager.add('bbcode', function () {
  return {
    init (editor) {
      editor.on('beforeSetContent', function (e) {
        e.content = Convert.bbcode2html(e.content);
      });

      editor.on('postProcess', function (e) {
        if (e.set) {
          e.content = Convert.bbcode2html(e.content);
        }

        if (e.get) {
          e.content = Convert.html2bbcode(e.content);
        }
      });
    }
  };
});

export default function () { }