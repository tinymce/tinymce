/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Api from './api/Api';
import ImportCss from './core/ImportCss';

export default function () {
  PluginManager.add('importcss', function (editor) {
    ImportCss.setup(editor);
    return Api.get(editor);
  });
}
